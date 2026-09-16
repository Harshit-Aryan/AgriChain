import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmMatchesDto {
  @ApiProperty()
  @IsString()
  demandId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  matchIds!: string[];
}
