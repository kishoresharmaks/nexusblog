import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArticleStatus, DifficultyLevel, ArticleType } from '@prisma/client';

export class QueryArticleDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'redis' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 'system-design' })
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @ApiPropertyOptional({ example: 'caching' })
  @IsString()
  @IsOptional()
  tagSlug?: string;

  @ApiPropertyOptional({ example: 'redis' })
  @IsString()
  @IsOptional()
  technologySlug?: string;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ example: 'SYSTEM_DESIGN' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @ApiPropertyOptional({ example: 'featured' })
  @IsString()
  @IsOptional()
  filter?: 'featured' | 'popular' | 'latest';
}
