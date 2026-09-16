import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { getCoords } from '../common/utils/geo.util';

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true, phone: true } }, farms: true },
    });
    if (!farmer) throw new NotFoundException('Farmer profile not found');
    return farmer;
  }

  async getFPOProfile(userId: string) {
    const fpo = await this.prisma.fPO.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        members: { include: { farmer: { include: { user: { select: { name: true } } } } } },
      },
    });
    if (!fpo) throw new NotFoundException('FPO profile not found');
    return fpo;
  }

  async createListing(userId: string, role: string, dto: CreateListingDto) {
    const coords = getCoords(dto.location);
    const data = {
      productId: dto.productId,
      quantity: dto.quantity,
      availableQty: dto.quantity,
      grade: dto.grade,
      expectedPrice: dto.expectedPrice,
      harvestDate: new Date(dto.harvestDate),
      location: dto.location,
      latitude: dto.latitude ?? coords.lat,
      longitude: dto.longitude ?? coords.lng,
    };

    if (role === 'FPO') {
      const fpo = await this.prisma.fPO.findUnique({ where: { userId } });
      if (!fpo) throw new NotFoundException('FPO not found');
      return this.prisma.produceListing.create({ data: { ...data, fpoId: fpo.id } });
    }

    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new NotFoundException('Farmer not found');
    return this.prisma.produceListing.create({ data: { ...data, farmerId: farmer.id } });
  }

  async getListings(userId: string, role: string) {
    if (role === 'FPO') {
      const fpo = await this.prisma.fPO.findUnique({ where: { userId } });
      if (!fpo) throw new NotFoundException('FPO not found');
      return this.prisma.produceListing.findMany({
        where: { fpoId: fpo.id },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new NotFoundException('Farmer not found');
    return this.prisma.produceListing.findMany({
      where: { farmerId: farmer.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDemands() {
    return this.prisma.demand.findMany({
      where: { status: { in: ['OPEN', 'MATCHING'] } },
      include: { product: true, buyer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMatchingOpportunities(userId: string, role: string) {
    let entityId: string | undefined;
    if (role === 'FPO') {
      const fpo = await this.prisma.fPO.findUnique({ where: { userId } });
      entityId = fpo?.id;
    } else {
      const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
      entityId = farmer?.id;
    }
    if (!entityId) return [];

    return this.prisma.supplierMatch.findMany({
      where: role === 'FPO' ? { fpoId: entityId } : { farmerId: entityId },
      include: { demand: { include: { product: true, buyer: true } } },
      orderBy: { matchScore: 'desc' },
    });
  }

  async getOrders(userId: string, role: string) {
    if (role === 'FPO') {
      const fpo = await this.prisma.fPO.findUnique({ where: { userId } });
      if (!fpo) return [];
      return this.prisma.orderItem.findMany({
        where: { fpoId: fpo.id },
        include: { order: { include: { buyer: true, statusHistory: true } } },
        orderBy: { order: { createdAt: 'desc' } },
      });
    }
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) return [];
    return this.prisma.orderItem.findMany({
      where: { farmerId: farmer.id },
      include: { order: { include: { buyer: true, statusHistory: true } } },
      orderBy: { order: { createdAt: 'desc' } },
    });
  }

  async getEarnings(userId: string, role: string) {
    const orders = await this.getOrders(userId, role);
    const total = orders.reduce((sum, o) => sum + o.farmerPayout, 0);
    return { totalEarnings: total, orderCount: orders.length, orders };
  }

  async getReliability(userId: string, role: string) {
    if (role === 'FPO') {
      const fpo = await this.prisma.fPO.findUnique({ where: { userId } });
      if (!fpo) throw new NotFoundException('FPO not found');
      return {
        score: fpo.reliabilityScore,
        onTimeRate: fpo.onTimeRate,
        orderCompletion: fpo.totalOrders > 0 ? (fpo.completedOrders / fpo.totalOrders) * 100 : 0,
        qualityConsistency: fpo.qualityRate,
        cancellationRate: fpo.cancellationRate,
        avgRating: fpo.avgRating,
      };
    }
    const farmer = await this.prisma.farmer.findUnique({ where: { userId } });
    if (!farmer) throw new NotFoundException('Farmer not found');
    return {
      score: farmer.reliabilityScore,
      onTimeRate: farmer.onTimeRate,
      orderCompletion: farmer.totalOrders > 0 ? (farmer.completedOrders / farmer.totalOrders) * 100 : 0,
      qualityConsistency: farmer.qualityRate,
      cancellationRate: farmer.cancellationRate,
      avgRating: farmer.avgRating,
    };
  }
}
