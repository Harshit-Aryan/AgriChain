import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDemandDto } from './dto/create-demand.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Buyers')
@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BuyersController {
  constructor(private buyersService: BuyersService) {}

  @Get('profile')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get buyer profile' })
  getProfile(@Request() req: { user: { sub: string } }) {
    return this.buyersService.getProfile(req.user.sub);
  }

  @Post('demands')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Create demand request' })
  createDemand(@Request() req: { user: { sub: string } }, @Body() dto: CreateDemandDto) {
    return this.buyersService.createDemand(req.user.sub, dto);
  }

  @Get('demands')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get own demands' })
  getDemands(@Request() req: { user: { sub: string } }) {
    return this.buyersService.getDemands(req.user.sub);
  }

  @Get('supply')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'View available supply' })
  getSupply() {
    return this.buyersService.getAvailableSupply();
  }

  @Get('orders')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get buyer orders' })
  getOrders(@Request() req: { user: { sub: string } }) {
    return this.buyersService.getOrders(req.user.sub);
  }
}
