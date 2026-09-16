import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ForecastService {
  constructor(private prisma: PrismaService) {}

  async getForecast(productName: string, location: string) {
    const product = await this.prisma.product.findFirst({
      where: { name: { equals: productName, mode: 'insensitive' } },
    });
    if (!product) throw new NotFoundException('Product not found');

    let forecast = await this.prisma.demandForecast.findFirst({
      where: {
        productId: product.id,
        location: { contains: location, mode: 'insensitive' },
      },
      orderBy: { forecastDate: 'desc' },
      include: { product: true },
    });

    if (!forecast) {
      forecast = await this.generateForecast(product.id, product.name, location);
    }

    const historicalOrders = await this.prisma.order.findMany({
      where: {
        deliveryLocation: { contains: location, mode: 'insensitive' },
        demand: { productId: product.id },
      },
      select: { totalQuantity: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return {
      product: product.name,
      location,
      currentWeeklyDemand: forecast.currentDemand,
      predictedDemand: forecast.predictedDemand,
      expectedChangePercent: forecast.changePercent,
      potentialShortage: forecast.potentialShortage,
      season: forecast.season,
      historicalData: historicalOrders,
      isEstimate: true,
      disclaimer: 'This prediction is an ESTIMATE based on historical order data and seasonal patterns. Actual demand may vary.',
    };
  }

  private async generateForecast(productId: string, productName: string, location: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        deliveryLocation: { contains: location, mode: 'insensitive' },
        demand: { productId },
      },
    });

    const currentDemand = orders.length > 0
      ? orders.reduce((s, o) => s + o.totalQuantity, 0) / Math.max(orders.length, 1)
      : 12500;

    const month = new Date().getMonth();
    const seasonalFactor = [0.9, 0.85, 1.0, 1.1, 1.2, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9, 0.85][month];
    const predictedDemand = currentDemand * seasonalFactor * 1.08;
    const changePercent = ((predictedDemand - currentDemand) / currentDemand) * 100;
    const supplyListings = await this.prisma.produceListing.aggregate({
      where: { productId, location: { contains: location.split(' ')[0], mode: 'insensitive' } },
      _sum: { availableQty: true },
    });
    const availableSupply = supplyListings._sum.availableQty ?? 0;
    const potentialShortage = Math.max(0, predictedDemand - availableSupply);

    return this.prisma.demandForecast.create({
      data: {
        productId,
        location,
        currentDemand,
        predictedDemand: Math.round(predictedDemand),
        changePercent: Math.round(changePercent * 10) / 10,
        potentialShortage: Math.round(potentialShortage),
        season: this.getSeason(month),
        isEstimate: true,
      },
      include: { product: true },
    });
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'Summer';
    if (month >= 5 && month <= 8) return 'Monsoon';
    if (month >= 9 && month <= 10) return 'Post-Monsoon';
    return 'Winter';
  }

  async getAllForecasts() {
    return this.prisma.demandForecast.findMany({
      include: { product: true },
      orderBy: { forecastDate: 'desc' },
    });
  }
}
