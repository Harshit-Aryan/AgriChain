import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForecastService } from './forecast.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Forecast')
@Controller('forecast')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ForecastController {
  constructor(private forecastService: ForecastService) {}

  @Get(':product/:location')
  @ApiOperation({ summary: 'Get demand forecast for product and location' })
  getForecast(@Param('product') product: string, @Param('location') location: string) {
    return this.forecastService.getForecast(decodeURIComponent(product), decodeURIComponent(location));
  }

  @Get()
  @ApiOperation({ summary: 'Get all forecasts' })
  getAll() {
    return this.forecastService.getAllForecasts();
  }
}
