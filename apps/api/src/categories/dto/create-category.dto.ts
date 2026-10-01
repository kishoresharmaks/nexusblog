import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'System Design' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'system-design' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'Architectural patterns, scalability blueprints, and distributed designs.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/images/categories/system-design.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ example: 'System Design Architecture Case Studies' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Comprehensive system design case studies and architectural patterns.' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
