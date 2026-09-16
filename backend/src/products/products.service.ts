import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  findByName(name: string) {
    return this.prisma.product.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
  }
}
