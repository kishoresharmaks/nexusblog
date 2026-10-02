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

  @ApiPropertyOptional({ example: 'A deep dive into sub-millisecond sliding window rate limiting.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'MDX article body with code blocks and diagrams' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.nexusnation.in/covers/redis.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId or Slug of Category' })
  @IsOptional()
  @IsString()
  categoryId?: string;

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

  @ApiPropertyOptional({ example: 'TUTORIAL' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Distributed systems engineer at HighScale Inc.' })
  @IsOptional()
  @IsString()
  authorBio?: string;

  @ApiPropertyOptional({ example: 'https://cdn.nexusnation.in/avatars/me.jpg' })
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

  @ApiPropertyOptional({ example: 'Alex Developer' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional({ example: 'alex@example.com' })
  @IsOptional()
  @IsString()
  guestEmail?: string;

  @ApiPropertyOptional({ default: false, description: 'True to submit for editorial review immediately' })
  @IsOptional()
  @IsBoolean()
  submitForReview?: boolean;

  @ApiPropertyOptional({ description: 'Resubmit for review if revisions were requested' })
  @IsOptional()
  @IsBoolean()
  resubmit?: boolean;

  @ApiPropertyOptional({ description: 'Secret edit token for anonymous guest posts' })
  @IsOptional()
  @IsString()
  editToken?: string;
}
