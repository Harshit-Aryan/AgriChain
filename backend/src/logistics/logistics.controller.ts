import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { AssignJobDto } from './dto/assign-job.dto';
import { UserRole } from '@prisma/client';

@ApiTags('Logistics')
@Controller('logistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LogisticsController {
  constructor(private logisticsService: LogisticsService) {}

  @Get('profile')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LOGISTICS)
  @ApiOperation({ summary: 'Get logistics provider profile' })
  getProfile(@Request() req: { user: { sub: string } }) {
    return this.logisticsService.getProfile(req.user.sub);
  }

  @Post('vehicles')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LOGISTICS)
  @ApiOperation({ summary: 'Add vehicle' })
  addVehicle(@Request() req: { user: { sub: string } }, @Body() dto: CreateVehicleDto) {
    return this.logisticsService.addVehicle(req.user.sub, dto);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create logistics job for order' })
  createJob(@Body('orderId') orderId: string) {
    return this.logisticsService.createJobForOrder(orderId);
  }

  @Get('jobs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LOGISTICS)
  @ApiOperation({ summary: 'Get available jobs' })
  getAvailableJobs() {
    return this.logisticsService.getAvailableJobs();
  }

  @Get('jobs/my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LOGISTICS)
  @ApiOperation({ summary: 'Get assigned jobs' })
  getMyJobs(@Request() req: { user: { sub: string } }) {
    return this.logisticsService.getJobsForProvider(req.user.sub);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get logistics job details' })
  getJob(@Param('id') id: string) {
    return this.logisticsService.getJob(id);
  }

  @Patch('jobs/:id/assign')
  @ApiOperation({ summary: 'Assign vehicle to job' })
  assignJob(@Param('id') id: string, @Body() dto: AssignJobDto) {
    return this.logisticsService.assignJob(id, dto);
  }

  @Patch('jobs/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LOGISTICS)
  @ApiOperation({ summary: 'Update job status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.logisticsService.updateJobStatus(id, status);
  }
}
