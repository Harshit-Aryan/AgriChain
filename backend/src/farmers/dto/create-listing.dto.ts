import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QualityGrade } from '@prisma/client';

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ enum: QualityGrade })
  @IsEnum(QualityGrade)
  grade!: QualityGrade;

  @ApiProperty({ example: 22 })
  @IsNumber()
  expectedPrice!: number;

  @ApiProperty({ example: '2026-09-18' })
  @IsDateString()
  harvestDate!: string;

  @ApiProperty({ example: 'Nashik' })
  @IsString()
  location!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
