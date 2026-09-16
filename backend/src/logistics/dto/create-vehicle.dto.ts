import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type!: VehicleType;

  @ApiProperty()
  @IsString()
  registration!: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  capacity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentLng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  costPerKm?: number;
}
