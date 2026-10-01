import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'Updated alt text for accessibility' })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional({ example: 'Updated figure caption' })
  @IsString()
  @IsOptional()
  caption?: string;
}

export class QueryMediaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'diagram' })
  @IsString()
  @IsOptional()
  search?: string;
}
