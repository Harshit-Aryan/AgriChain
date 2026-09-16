import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfirmMatchesDto } from './dto/confirm-matches.dto';

@ApiTags('Matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('demand/:id')
  @ApiOperation({ summary: 'Get/run AI supplier matching for demand' })
  getDemandMatches(@Param('id') id: string) {
    return this.matchingService.matchDemand(id);
  }

  @Post('demand/:id/run')
  @ApiOperation({ summary: 'Run AI matching algorithm' })
  runMatching(@Param('id') id: string) {
    return this.matchingService.matchDemand(id);
  }

  @Get('demand/:id/results')
  @ApiOperation({ summary: 'Get existing match results' })
  getResults(@Param('id') id: string) {
    return this.matchingService.getDemandMatches(id);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm selected supplier matches' })
  confirmMatches(@Body() dto: ConfirmMatchesDto) {
    return this.matchingService.confirmMatches(dto.demandId, dto.matchIds);
  }
}
