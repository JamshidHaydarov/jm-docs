import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GiveAccessDto {
  @ApiProperty()
  @IsNumber()
  userId: number;


  @ApiProperty()
  @IsNumber()
  fileId: number;
}