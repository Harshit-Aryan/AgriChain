import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone,
        role: dto.role,
      },
    });

    await this.createRoleProfile(user.id, dto);

    const token = this.generateToken(user.id, user.email, user.role);
    const profile = await this.getProfile(user.id);

    return { token, user: profile };
  }

  private async createRoleProfile(userId: string, dto: RegisterDto) {
    switch (dto.role) {
      case UserRole.FARMER:
        await this.prisma.farmer.create({
          data: {
            userId,
            farmName: dto.farmName || `${dto.name}'s Farm`,
            location: dto.location || 'Nashik',
            latitude: dto.latitude,
            longitude: dto.longitude,
            state: dto.state || 'Maharashtra',
            district: dto.district,
          },
        });
        break;
      case UserRole.FPO:
        await this.prisma.fPO.create({
          data: {
            userId,
            name: dto.fpoName || `${dto.name} FPO`,
            location: dto.location || 'Nashik',
            latitude: dto.latitude,
            longitude: dto.longitude,
            state: dto.state || 'Maharashtra',
          },
        });
        break;
      case UserRole.BUYER:
        await this.prisma.buyer.create({
          data: {
            userId,
            company: dto.company || dto.name,
            buyerType: dto.buyerType || 'RESTAURANT',
            location: dto.location || 'Mumbai',
            latitude: dto.latitude,
            longitude: dto.longitude,
            address: dto.address,
          },
        });
        break;
      case UserRole.LOGISTICS:
        await this.prisma.logisticsProvider.create({
          data: {
            userId,
            company: dto.company || `${dto.name} Logistics`,
            location: dto.location || 'Mumbai',
            latitude: dto.latitude,
            longitude: dto.longitude,
            costPerKm: dto.costPerKm || 25,
          },
        });
        break;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) throw new UnauthorizedException('Account deactivated');

    const token = this.generateToken(user.id, user.email, user.role);
    const profile = await this.getProfile(user.id);
    return { token, user: profile };
  }

  private generateToken(id: string, email: string, role: UserRole) {
    return this.jwtService.sign({ sub: id, email, role });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        farmer: true,
        fpo: true,
        buyer: true,
        logisticsProvider: { include: { vehicles: true } },
      },
    });
    return user;
  }
}
