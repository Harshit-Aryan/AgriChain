import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createFromDemand(userId: string, dto: CreateOrderDto) {
    const buyer = await this.prisma.buyer.findUnique({ where: { userId } });
    if (!buyer) throw new NotFoundException('Buyer not found');

    const demand = await this.prisma.demand.findUnique({
      where: { id: dto.demandId },
      include: {
        product: true,
        supplierMatches: {
          where: dto.matchIds?.length ? { id: { in: dto.matchIds } } : { isSelected: true },
          include: { listing: true, farmer: true, fpo: true },
        },
      },
    });
    if (!demand) throw new NotFoundException('Demand not found');
    if (demand.buyerId !== buyer.id) throw new BadRequestException('Not your demand');

    const matches = demand.supplierMatches.length > 0
      ? demand.supplierMatches
      : await this.prisma.supplierMatch.findMany({
          where: { demandId: demand.id },
          include: { listing: true, farmer: true, fpo: true },
          orderBy: { matchScore: 'desc' },
        });

    if (matches.length === 0) throw new BadRequestException('No supplier matches found. Run matching first.');

    const totalQty = matches.reduce((s, m) => s + m.allocatedQty, 0);
    const pricePerKg = demand.maxPrice;
    const totalAmount = totalQty * pricePerKg;
    const logisticsCostPerKg = 2;
    const platformFeePerKg = 0.5;
    const logisticsCost = totalQty * logisticsCostPerKg;
    const platformFee = totalQty * platformFeePerKg;
    const farmerRealization = pricePerKg - logisticsCostPerKg - platformFeePerKg;
    const traditionalRealization = farmerRealization - 2.5;

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyer.id,
        demandId: demand.id,
        status: 'CONFIRMED',
        totalQuantity: totalQty,
        totalAmount,
        logisticsCost,
        platformFee,
        pricePerKg,
        deliveryLocation: demand.deliveryLocation,
        deliveryLat: demand.deliveryLat,
        deliveryLng: demand.deliveryLng,
        requiredBy: demand.requiredBy,
        traditionalRealization,
        platformRealization: farmerRealization,
        items: {
          create: matches.map((m) => ({
            farmerId: m.farmerId,
            fpoId: m.fpoId,
            productName: demand.product.name,
            quantity: m.allocatedQty,
            grade: demand.grade,
            pricePerKg: m.listing.expectedPrice,
            totalPrice: m.allocatedQty * pricePerKg,
            farmerPayout: m.allocatedQty * (m.listing.expectedPrice),
          })),
        },
        statusHistory: {
          create: [
            { status: 'PENDING', note: 'Order created' },
            { status: 'CONFIRMED', note: 'Supplier matches confirmed' },
          ],
        },
        payments: {
          create: {
            amount: totalAmount,
            platformFee,
            logisticsFee: logisticsCost,
            farmerPayout: matches.reduce((s, m) => s + m.allocatedQty * m.listing.expectedPrice, 0),
            status: 'PENDING',
            breakdown: {
              buyerPays: pricePerKg,
              logisticsPerKg: logisticsCostPerKg,
              platformFeePerKg,
              farmerRealization,
              traditionalRealization,
              estimatedSavingsPerKg: farmerRealization - traditionalRealization,
              isEstimate: true,
            },
          },
        },
      },
      include: {
        items: { include: { farmer: { include: { user: { select: { name: true } } } }, fpo: true } },
        payments: true,
        statusHistory: true,
        demand: { include: { product: true } },
      },
    });

    await this.prisma.demand.update({ where: { id: demand.id }, data: { status: 'FULFILLED' } });

    for (const m of matches) {
      await this.prisma.produceListing.update({
        where: { id: m.listingId },
        data: { availableQty: { decrement: m.allocatedQty } },
      });
    }

    return order;
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        items: {
          include: {
            farmer: { include: { user: { select: { name: true } } } },
            fpo: true,
          },
        },
        logisticsJob: { include: { route: true, vehicle: true, provider: true } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        demand: { include: { product: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    await this.prisma.order.update({
      where: { id },
      data: {
        status,
        deliveredAt: status === 'DELIVERED' ? new Date() : order.deliveredAt,
      },
    });

    await this.prisma.orderStatusHistory.create({
      data: { orderId: id, status, note },
    });

    return this.findOne(id);
  }

  async getPriceBreakdown(id: string) {
    const order = await this.findOne(id);
    const payment = order.payments[0];
    const breakdown = payment?.breakdown as Record<string, unknown> | null;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalQuantity: order.totalQuantity,
      priceBreakdown: {
        buyerPaysPerKg: order.pricePerKg,
        logisticsPerKg: (order.logisticsCost / order.totalQuantity),
        platformFeePerKg: (order.platformFee / order.totalQuantity),
        farmerRealizationPerKg: order.platformRealization,
        traditionalRealizationPerKg: order.traditionalRealization,
        estimatedSavingsPerKg: (order.platformRealization ?? 0) - (order.traditionalRealization ?? 0),
      },
      totals: {
        buyerTotal: order.totalAmount,
        logisticsTotal: order.logisticsCost,
        platformFeeTotal: order.platformFee,
        farmerPayoutTotal: payment?.farmerPayout ?? 0,
      },
      comparison: {
        traditional: order.traditionalRealization,
        platform: order.platformRealization,
        difference: (order.platformRealization ?? 0) - (order.traditionalRealization ?? 0),
        label: 'Estimated improvement based on current transaction assumptions',
      },
      isEstimate: true,
      details: breakdown,
    };
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        buyer: true,
        items: true,
        demand: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
