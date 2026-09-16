import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalFarmers,
      totalFPOs,
      totalBuyers,
      activeDemands,
      activeListings,
      activeOrders,
      orders,
      demands,
      listings,
      forecasts,
    ] = await Promise.all([
      this.prisma.farmer.count(),
      this.prisma.fPO.count(),
      this.prisma.buyer.count(),
      this.prisma.demand.count({ where: { status: { in: ['OPEN', 'MATCHING', 'MATCHED'] } } }),
      this.prisma.produceListing.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.order.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      this.prisma.order.findMany({ include: { demand: { include: { product: true } } } }),
      this.prisma.demand.findMany({ include: { product: true } }),
      this.prisma.produceListing.findMany({ include: { product: true } }),
      this.prisma.demandForecast.findMany({ include: { product: true } }),
    ]);

    const totalTransactionValue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const avgPlatformRealization = orders.length > 0
      ? orders.reduce((s, o) => s + (o.platformRealization ?? 0), 0) / orders.length
      : 0;
    const avgTraditionalRealization = orders.length > 0
      ? orders.reduce((s, o) => s + (o.traditionalRealization ?? 0), 0) / orders.length
      : 0;
    const estimatedFarmerImprovement = avgPlatformRealization - avgTraditionalRealization;

    const logisticsJobs = await this.prisma.logisticsJob.findMany();
    const estimatedLogisticsSavings = logisticsJobs.reduce((s, j) => s + (j.consolidatedSaving ?? 0), 0);

    const cropDemandMap: Record<string, number> = {};
    for (const d of demands) {
      const name = d.product.name;
      cropDemandMap[name] = (cropDemandMap[name] || 0) + d.quantity;
    }
    const topDemandedCrops = Object.entries(cropDemandMap)
      .map(([crop, quantity]) => ({ crop, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);

    const supplyDemandGaps = forecasts.map((f) => ({
      product: f.product.name,
      location: f.location,
      demand: f.predictedDemand,
      shortage: f.potentialShortage,
      isEstimate: true,
    }));

    const ordersByCrop: Record<string, number> = {};
    for (const o of orders) {
      const crop = o.demand?.product.name ?? 'Unknown';
      ordersByCrop[crop] = (ordersByCrop[crop] || 0) + 1;
    }

    const regionalDemand: Record<string, number> = {};
    for (const d of demands) {
      regionalDemand[d.deliveryLocation] = (regionalDemand[d.deliveryLocation] || 0) + d.quantity;
    }

    const monthlyOrders = this.groupByMonth(orders);

    return {
      summary: {
        totalFarmers,
        totalFPOs,
        totalBuyers,
        activeDemands,
        activeListings,
        activeOrders,
        totalTransactionValue: Math.round(totalTransactionValue),
        estimatedFarmerImprovement: Math.round(estimatedFarmerImprovement * 100) / 100,
        estimatedLogisticsSavings: Math.round(estimatedLogisticsSavings),
        isEstimate: true,
      },
      charts: {
        demandTrend: monthlyOrders,
        supplyVsDemand: topDemandedCrops.map((c) => ({
          crop: c.crop,
          demand: c.quantity,
          supply: listings.filter((l) => l.product.name === c.crop).reduce((s, l) => s + l.availableQty, 0),
        })),
        ordersByCrop: Object.entries(ordersByCrop).map(([crop, count]) => ({ crop, count })),
        regionalDemand: Object.entries(regionalDemand).map(([region, quantity]) => ({ region, quantity })),
        farmerEarnings: orders.map((o) => ({
          date: o.createdAt,
          amount: o.totalAmount * 0.85,
        })),
      },
      topDemandedCrops,
      supplyDemandGaps,
    };
  }

  private groupByMonth(orders: { createdAt: Date; totalQuantity: number }[]) {
    const months: Record<string, number> = {};
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 7);
      months[key] = (months[key] || 0) + o.totalQuantity;
    }
    return Object.entries(months)
      .map(([month, quantity]) => ({ month, quantity }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
