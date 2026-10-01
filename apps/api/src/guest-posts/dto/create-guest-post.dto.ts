import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DifficultyLevel, ArticleType } from '@prisma/client';

export class CreateGuestPostDto {
  @ApiProperty({ example: 'Designing a Distributed Rate Limiter with Redis' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'designing-distributed-rate-limiter' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'A deep dive into sub-millisecond sliding window rate limiting.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  excerpt!: string;

  @ApiProperty({ description: 'MDX article body with code blocks and diagrams' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.nexusblog.dev/covers/redis.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ description: 'MongoDB ObjectId of Category' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ type: [String], description: 'MongoDB ObjectIds of Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'MongoDB ObjectIds of Technologies' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologyIds?: string[];

  @ApiPropertyOptional({ enum: DifficultyLevel, default: DifficultyLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: ArticleType, default: ArticleType.TUTORIAL })
  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @ApiPropertyOptional({ example: 'Distributed systems engineer at HighScale Inc.' })
  @IsOptional()
  @IsString()
  authorBio?: string;

  @ApiPropertyOptional({ example: 'https://cdn.nexusblog.dev/avatars/me.jpg' })
  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  socialLinks?: Record<string, any>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ default: false, description: 'True to submit for editorial review immediately' })
  @IsOptional()
  @IsBoolean()
  submitForReview?: boolean;
}
