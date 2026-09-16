import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { optimizeRoute, RoutePoint } from '../common/utils/route.util';
import { getCoords } from '../common/utils/geo.util';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const provider = await this.prisma.logisticsProvider.findUnique({
      where: { userId },
      include: { vehicles: true, user: { select: { name: true, email: true } } },
    });
    if (!provider) throw new NotFoundException('Logistics provider not found');
    return provider;
  }

  async addVehicle(userId: string, dto: CreateVehicleDto) {
    const provider = await this.prisma.logisticsProvider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider not found');
    return this.prisma.vehicle.create({
      data: { ...dto, providerId: provider.id },
    });
  }

  async createJobForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            farmer: true,
            fpo: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.prisma.logisticsJob.findUnique({ where: { orderId } });
    if (existing) return this.getJob(existing.id);

    const pickups: RoutePoint[] = order.items.map((item, idx) => {
      const loc = item.fpo?.location || item.farmer?.location || 'Nashik';
      const coords = getCoords(loc);
      return {
        id: `pickup-${idx}`,
        name: item.fpo?.name || `Farmer ${idx + 1}`,
        lat: item.fpo?.latitude ?? item.farmer?.latitude ?? coords.lat,
        lng: item.fpo?.longitude ?? item.farmer?.longitude ?? coords.lng,
        load: item.quantity,
        type: 'pickup' as const,
      };
    });

    const deliveryCoords = {
      lat: order.deliveryLat ?? getCoords(order.deliveryLocation).lat,
      lng: order.deliveryLng ?? getCoords(order.deliveryLocation).lng,
    };

    const delivery: RoutePoint = {
      id: 'delivery',
      name: order.deliveryLocation,
      lat: deliveryCoords.lat,
      lng: deliveryCoords.lng,
      load: 0,
      type: 'delivery',
    };

    const route = optimizeRoute(pickups, delivery, 25);

    const job = await this.prisma.logisticsJob.create({
      data: {
        orderId,
        status: 'PENDING',
        totalLoad: order.totalQuantity,
        totalDistance: route.totalDistance,
        estimatedCost: route.estimatedCost,
        consolidatedSaving: route.consolidatedSaving,
        separateTripsCost: route.separateTripsCost,
        pickupSequence: route.points.filter((p) => p.type === 'pickup') as any,
        routePoints: route.points as any,
        route: {
          create: {
            waypoints: route.points as any,
            optimizedOrder: route.optimizedOrder,
            totalDistance: route.totalDistance,
            estimatedTime: route.estimatedTimeHours,
            estimatedCost: route.estimatedCost,
            vehicleCapacity: 2500,
          },
        },
      },
      include: { route: true, order: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });
    await this.prisma.orderStatusHistory.create({
      data: { orderId, status: 'PROCESSING', note: 'Logistics job created' },
    });

    return {
      ...job,
      routeOptimization: route,
      isEstimate: true,
    };
  }

  async assignJob(jobId: string, dto: AssignJobDto) {
    const job = await this.prisma.logisticsJob.update({
      where: { id: jobId },
      data: {
        providerId: dto.providerId,
        vehicleId: dto.vehicleId,
        status: 'ASSIGNED',
      },
      include: { route: true, vehicle: true, provider: true, order: true },
    });

    if (job.orderId) {
      await this.prisma.order.update({ where: { id: job.orderId }, data: { status: 'READY_FOR_PICKUP' } });
      await this.prisma.orderStatusHistory.create({
        data: { orderId: job.orderId, status: 'READY_FOR_PICKUP', note: 'Vehicle assigned' },
      });
    }

    return job;
  }

  async getJob(id: string) {
    const job = await this.prisma.logisticsJob.findUnique({
      where: { id },
      include: {
        route: true,
        vehicle: true,
        provider: { include: { user: { select: { name: true } } } },
        order: {
          include: {
            items: { include: { farmer: true, fpo: true } },
            buyer: true,
            statusHistory: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getJobsForProvider(userId: string) {
    const provider = await this.prisma.logisticsProvider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider not found');
    return this.prisma.logisticsJob.findMany({
      where: { providerId: provider.id },
      include: { route: true, vehicle: true, order: { include: { buyer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAvailableJobs() {
    return this.prisma.logisticsJob.findMany({
      where: { status: 'PENDING' },
      include: { route: true, order: { include: { buyer: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateJobStatus(id: string, status: string) {
    const job = await this.prisma.logisticsJob.update({
      where: { id },
      data: {
        status: status as 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      include: { order: true },
    });

    if (job.orderId) {
      const orderStatus = status === 'IN_PROGRESS' ? 'IN_TRANSIT' : status === 'COMPLETED' ? 'DELIVERED' : undefined;
      if (orderStatus) {
        await this.prisma.order.update({ where: { id: job.orderId }, data: { status: orderStatus } });
        await this.prisma.orderStatusHistory.create({
          data: { orderId: job.orderId, status: orderStatus, note: `Logistics: ${status}` },
        });
      }
    }

    return job;
  }
}
