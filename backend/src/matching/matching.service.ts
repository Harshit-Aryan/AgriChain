import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { findOptimalCombination, ListingCandidate } from '../common/utils/matching.util';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async matchDemand(demandId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
      include: { product: true, buyer: true },
    });
    if (!demand) throw new NotFoundException('Demand not found');

    await this.prisma.supplierMatch.deleteMany({ where: { demandId } });

    const listings = await this.prisma.produceListing.findMany({
      where: {
        productId: demand.productId,
        status: 'AVAILABLE',
        availableQty: { gt: 0 },
        grade: demand.grade,
        expectedPrice: { lte: demand.maxPrice },
      },
      include: {
        farmer: { include: { user: { select: { name: true } } } },
        fpo: { include: { user: { select: { name: true } } } },
      },
    });

    const candidates: ListingCandidate[] = listings.map((l) => ({
      id: l.id,
      listingId: l.id,
      supplierId: l.fpoId || l.farmerId || l.id,
      supplierName: l.fpo?.name || l.farmer?.user.name || 'Unknown',
      supplierType: l.fpoId ? 'fpo' : 'farmer',
      farmerId: l.farmerId ?? undefined,
      fpoId: l.fpoId ?? undefined,
      quantity: l.quantity,
      availableQty: l.availableQty,
      grade: l.grade,
      expectedPrice: l.expectedPrice,
      location: l.location,
      latitude: l.latitude,
      longitude: l.longitude,
      reliabilityScore: l.fpo?.reliabilityScore ?? l.farmer?.reliabilityScore ?? 75,
      onTimeRate: l.fpo?.onTimeRate ?? l.farmer?.onTimeRate ?? 85,
      qualityRate: l.fpo?.qualityRate ?? l.farmer?.qualityRate ?? 85,
    }));

    const matches = findOptimalCombination(
      candidates,
      demand.quantity,
      demand.maxPrice,
      demand.deliveryLocation,
      demand.grade,
    );

    const totalAllocated = matches.reduce((s, m) => s + m.allocatedQty, 0);
    const shortage = Math.max(0, demand.quantity - totalAllocated);

    const savedMatches = await Promise.all(
      matches.map((m) =>
        this.prisma.supplierMatch.create({
          data: {
            demandId,
            listingId: m.listingId,
            farmerId: m.farmerId,
            fpoId: m.fpoId,
            allocatedQty: m.allocatedQty,
            matchScore: m.matchScore,
            priceScore: m.priceScore,
            distanceScore: m.distanceScore,
            quantityScore: m.quantityScore,
            qualityScore: m.qualityScore,
            deliveryScore: m.deliveryScore,
            reliabilityScore: m.reliabilityScore,
          },
          include: {
            farmer: { include: { user: { select: { name: true } } } },
            fpo: true,
            listing: true,
          },
        }),
      ),
    );

    await this.prisma.demand.update({
      where: { id: demandId },
      data: { status: totalAllocated >= demand.quantity ? 'MATCHED' : 'MATCHING' },
    });

    return {
      demand,
      matches: savedMatches.map((m) => ({
        ...m,
        supplierName: m.fpo?.name || m.farmer?.user.name,
        supplierType: m.fpoId ? 'FPO' : 'Farmer',
        scoreBreakdown: {
          price: m.priceScore,
          distance: m.distanceScore,
          quantity: m.quantityScore,
          quality: m.qualityScore,
          delivery: m.deliveryScore,
          reliability: m.reliabilityScore,
        },
      })),
      consolidation: {
        totalRequired: demand.quantity,
        totalAllocated,
        shortage,
        supplierCount: savedMatches.length,
        isFullyMatched: totalAllocated >= demand.quantity,
      },
      isEstimate: true,
    };
  }

  async confirmMatches(demandId: string, matchIds: string[]) {
    const demand = await this.prisma.demand.findUnique({ where: { id: demandId } });
    if (!demand) throw new NotFoundException('Demand not found');

    await this.prisma.supplierMatch.updateMany({
      where: { demandId },
      data: { isSelected: false },
    });

    await this.prisma.supplierMatch.updateMany({
      where: { id: { in: matchIds }, demandId },
      data: { isSelected: true },
    });

    const selected = await this.prisma.supplierMatch.findMany({
      where: { id: { in: matchIds }, demandId },
      include: { listing: true, farmer: true, fpo: true },
    });

    const totalQty = selected.reduce((s, m) => s + m.allocatedQty, 0);
    if (totalQty < demand.quantity * 0.9) {
      throw new BadRequestException('Selected suppliers do not meet minimum quantity requirement');
    }

    return { confirmed: selected.length, totalQuantity: totalQty, matches: selected };
  }

  async getDemandMatches(demandId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
      include: {
        product: true,
        buyer: true,
        supplierMatches: {
          include: {
            farmer: { include: { user: { select: { name: true } } } },
            fpo: true,
            listing: true,
          },
          orderBy: { matchScore: 'desc' },
        },
      },
    });
    if (!demand) throw new NotFoundException('Demand not found');

    return {
      demand,
      matches: demand.supplierMatches.map((m) => ({
        ...m,
        supplierName: m.fpo?.name || m.farmer?.user.name,
        supplierType: m.fpoId ? 'FPO' : 'Farmer',
        scoreBreakdown: {
          price: m.priceScore,
          distance: m.distanceScore,
          quantity: m.quantityScore,
          quality: m.qualityScore,
          delivery: m.deliveryScore,
          reliability: m.reliabilityScore,
        },
      })),
    };
  }
}
