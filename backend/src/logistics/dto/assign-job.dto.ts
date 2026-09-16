import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignJobDto {
  @ApiProperty()
  @IsString()
  providerId!: string;

  @ApiProperty()
  @IsString()
  vehicleId!: string;
}
