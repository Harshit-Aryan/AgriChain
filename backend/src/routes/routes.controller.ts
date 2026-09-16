import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptimizeRouteDto } from './dto/optimize-route.dto';

@ApiTags('Routes')
@Controller('routes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize delivery route' })
  optimize(@Body() dto: OptimizeRouteDto) {
    return this.routesService.optimize(dto);
  }
}
