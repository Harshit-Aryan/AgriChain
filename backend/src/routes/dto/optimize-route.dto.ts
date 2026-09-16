import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PointDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty()
  @IsNumber()
  load!: number;
}

export class OptimizeRouteDto {
  @ApiProperty({ type: [PointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  pickups!: PointDto[];

  @ApiProperty({ type: PointDto })
  @ValidateNested()
  @Type(() => PointDto)
  delivery!: PointDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  costPerKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  vehicleCapacity?: number;
}
