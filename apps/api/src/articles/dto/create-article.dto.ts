import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ArticleStatus, DifficultyLevel, ArticleType } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({ example: 'Designing a Distributed Rate Limiter with Redis and NestJS' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'designing-distributed-rate-limiter' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'A production deep-dive into token bucket algorithms, Redis sliding window counters, and sub-millisecond API rate limiting.' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ example: '# Distributed Rate Limiting\n\nHigh-throughput APIs require reliable protection...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/images/rate-limiter-hero.png' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/images/rate-limiter-thumb.png' })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/images/rate-limiter-og.png' })
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.DRAFT })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;

  @ApiPropertyOptional({ enum: DifficultyLevel, default: DifficultyLevel.INTERMEDIATE })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ example: 'SYSTEM_DESIGN' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @Min(1)
  @IsOptional()
  readingTime?: number;

  @ApiPropertyOptional({ example: '674e1234abcd5678ef901234' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'system-design' })
  @IsString()
  @IsOptional()
  categorySlug?: string;

  @ApiPropertyOptional({ example: ['674e1234abcd5678ef901235'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ example: ['674e1234abcd5678ef901236'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  technologyIds?: string[];

  @ApiPropertyOptional({ example: '674e1234abcd5678ef901237' })
  @IsString()
  @IsOptional()
  seriesId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  seriesOrder?: number;

  @ApiPropertyOptional({ example: ['Understanding Redis data structures', 'Basic NestJS REST APIs'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prerequisites?: string[];

  @ApiPropertyOptional({ example: ['Sliding window counter algorithm', 'Sub-millisecond Redis Lua scripts'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keyTakeaways?: string[];

  @ApiPropertyOptional({ example: ['https://redis.io/commands/eval'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  references?: string[];

  @ApiPropertyOptional({ example: 'Distributed Rate Limiter: Architecture & Lua Scripts' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Learn how to architect and implement a distributed rate limiter with Redis, NestJS, and Lua scripts.' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'https://nexusblog.dev/articles/designing-distributed-rate-limiter' })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;
}
