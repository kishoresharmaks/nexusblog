import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSeriesDto {
  @ApiProperty({ example: 'System Design From Zero To Production' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'system-design-zero-to-prod' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'A step-by-step masterclass on scaling backend architectures from 1 to 10M users.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/images/series/system-design.png' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
