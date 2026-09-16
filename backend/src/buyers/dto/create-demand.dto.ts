import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QualityGrade } from '@prisma/client';

export class CreateDemandDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ enum: QualityGrade })
  @IsEnum(QualityGrade)
  grade!: QualityGrade;

  @ApiProperty({ example: 25 })
  @IsNumber()
  maxPrice!: number;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  deliveryLocation!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryLat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deliveryLng?: number;

  @ApiProperty({ example: '2026-09-20' })
  @IsDateString()
  requiredBy!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
