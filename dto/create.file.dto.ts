import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ example: 'example.txt' })
  @IsString()
  filename: string;
}