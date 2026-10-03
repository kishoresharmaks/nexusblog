import { IsString, IsOptional, IsEnum, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsEventTypeDto {
  PAGEVIEW = 'PAGEVIEW',
  SCROLL_DEPTH = 'SCROLL_DEPTH',
  CODE_COPY = 'CODE_COPY',
  BOOKMARK = 'BOOKMARK',
  SHARE = 'SHARE',
  OUTBOUND_CLICK = 'OUTBOUND_CLICK',
}

export class CollectEventDto {
  @ApiProperty({ enum: AnalyticsEventTypeDto, default: AnalyticsEventTypeDto.PAGEVIEW })
  @IsEnum(AnalyticsEventTypeDto)
  eventType!: AnalyticsEventTypeDto;

  @ApiProperty({ example: '/articles/distributed-consensus-raft' })
  @IsString()
  path!: string;

  @ApiPropertyOptional({ example: 'distributed-consensus-raft' })
  @IsOptional()
  @IsString()
  articleSlug?: string;

  @ApiPropertyOptional({ example: 'system-design' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ example: 'v_anon_98234ab8' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ example: 'sess_192834' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ example: 'https://news.ycombinator.com' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ example: 'newsletter' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ example: 'email' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ example: 'weekly_digest' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional({ example: 'macOS' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ example: 'Chrome' })
  @IsOptional()
  @IsString()
  browser?: string;

  @ApiPropertyOptional({ example: 'desktop' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  countryName?: string;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  scrollDepth?: number;

  @ApiPropertyOptional({ example: { language: 'typescript', snippet: 'raft-election' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SearchQueryDto {
  @ApiProperty({ example: 'Raft consensus' })
  @IsString()
  query!: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  resultsCount?: number;

  @ApiPropertyOptional({ example: 'v_anon_98234ab8' })
  @IsOptional()
  @IsString()
  visitorId?: string;
}
