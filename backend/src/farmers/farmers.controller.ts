import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateListingDto } from './dto/create-listing.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Farmers')
@Controller('farmers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Get('profile')
  @Roles(UserRole.FARMER)
  @ApiOperation({ summary: 'Get farmer profile' })
  getProfile(@Request() req: { user: { sub: string } }) {
    return this.farmersService.getProfile(req.user.sub);
  }

  @Get('fpo/profile')
  @Roles(UserRole.FPO)
  @ApiOperation({ summary: 'Get FPO profile' })
  getFPOProfile(@Request() req: { user: { sub: string } }) {
    return this.farmersService.getFPOProfile(req.user.sub);
  }

  @Post('listings')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'Create produce listing' })
  createListing(
    @Request() req: { user: { sub: string; role: string } },
    @Body() dto: CreateListingDto,
  ) {
    return this.farmersService.createListing(req.user.sub, req.user.role, dto);
  }

  @Get('listings')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'Get own listings' })
  getListings(@Request() req: { user: { sub: string; role: string } }) {
    return this.farmersService.getListings(req.user.sub, req.user.role);
  }

  @Get('demands')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'View buyer demands' })
  getDemands() {
    return this.farmersService.getDemands();
  }

  @Get('matching')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'View AI matching opportunities' })
  getMatching(@Request() req: { user: { sub: string; role: string } }) {
    return this.farmersService.getMatchingOpportunities(req.user.sub, req.user.role);
  }

  @Get('orders')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'Track orders' })
  getOrders(@Request() req: { user: { sub: string; role: string } }) {
    return this.farmersService.getOrders(req.user.sub, req.user.role);
  }

  @Get('earnings')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'View earnings' })
  getEarnings(@Request() req: { user: { sub: string; role: string } }) {
    return this.farmersService.getEarnings(req.user.sub, req.user.role);
  }

  @Get('reliability')
  @Roles(UserRole.FARMER, UserRole.FPO)
  @ApiOperation({ summary: 'View reliability score' })
  getReliability(@Request() req: { user: { sub: string; role: string } }) {
    return this.farmersService.getReliability(req.user.sub, req.user.role);
  }
}
