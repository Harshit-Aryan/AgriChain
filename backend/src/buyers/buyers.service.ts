import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDemandDto } from './dto/create-demand.dto';
import { getCoords } from '../common/utils/geo.util';

@Injectable()
export class BuyersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const buyer = await this.prisma.buyer.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
    if (!buyer) throw new NotFoundException('Buyer profile not found');
    return buyer;
  }

  async createDemand(userId: string, dto: CreateDemandDto) {
    const buyer = await this.prisma.buyer.findUnique({ where: { userId } });
    if (!buyer) throw new NotFoundException('Buyer not found');

    const coords = getCoords(dto.deliveryLocation);
    return this.prisma.demand.create({
      data: {
        buyerId: buyer.id,
        productId: dto.productId,
        quantity: dto.quantity,
        grade: dto.grade,
        maxPrice: dto.maxPrice,
        deliveryLocation: dto.deliveryLocation,
        deliveryLat: dto.deliveryLat ?? coords.lat,
        deliveryLng: dto.deliveryLng ?? coords.lng,
        requiredBy: new Date(dto.requiredBy),
        notes: dto.notes,
        status: 'OPEN',
      },
      include: { product: true, buyer: true },
    });
  }

  async getDemands(userId: string) {
    const buyer = await this.prisma.buyer.findUnique({ where: { userId } });
    if (!buyer) throw new NotFoundException('Buyer not found');
    return this.prisma.demand.findMany({
      where: { buyerId: buyer.id },
      include: {
        product: true,
        supplierMatches: {
          include: { farmer: { include: { user: { select: { name: true } } } }, fpo: true, listing: true },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableSupply() {
    return this.prisma.produceListing.findMany({
      where: { status: 'AVAILABLE', availableQty: { gt: 0 } },
      include: {
        product: true,
        farmer: { include: { user: { select: { name: true } } } },
        fpo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrders(userId: string) {
    const buyer = await this.prisma.buyer.findUnique({ where: { userId } });
    if (!buyer) throw new NotFoundException('Buyer not found');
    return this.prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: {
          include: {
            farmer: { include: { user: { select: { name: true } } } },
            fpo: true,
          },
        },
        logisticsJob: { include: { route: true, vehicle: true } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        demand: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
