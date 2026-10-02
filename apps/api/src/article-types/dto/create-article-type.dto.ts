import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateArticleTypeDto {
  @ApiProperty({ example: 'System Design' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'SYSTEM_DESIGN' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'Architectural analysis and distributed topologies' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'blue' })
  @IsString()
  @IsOptional()
  badgeColor?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  order?: number;
}
