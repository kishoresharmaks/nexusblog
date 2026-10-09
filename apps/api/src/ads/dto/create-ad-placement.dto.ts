import { IsString, IsEnum, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdNetworkDto {
  GOOGLE_ADSENSE = 'GOOGLE_ADSENSE',
  CARBON_ADS = 'CARBON_ADS',
  ETHICAL_ADS = 'ETHICAL_ADS',
  ADSTERRA = 'ADSTERRA',
  CUSTOM_HTML = 'CUSTOM_HTML',
  CUSTOM_IMAGE = 'CUSTOM_IMAGE',
}

export enum AdFormatDto {
  RESPONSIVE = 'RESPONSIVE',
  BANNER_728x90 = 'BANNER_728x90',
  RECTANGLE_300x250 = 'RECTANGLE_300x250',
  SKYSCRAPER_160x600 = 'SKYSCRAPER_160x600',
  IN_ARTICLE = 'IN_ARTICLE',
  IN_FEED = 'IN_FEED',
  AUTO = 'AUTO',
}

export enum AdStatusDto {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  DISABLED = 'DISABLED',
}

export class CreateAdPlacementDto {
  @ApiProperty({ example: 'Article Header Leaderboard' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'article-header' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ enum: AdNetworkDto, default: AdNetworkDto.GOOGLE_ADSENSE })
  @IsOptional()
  @IsEnum(AdNetworkDto)
  network?: AdNetworkDto;

  @ApiPropertyOptional({ enum: AdStatusDto, default: AdStatusDto.ACTIVE })
  @IsOptional()
  @IsEnum(AdStatusDto)
  status?: AdStatusDto;

  @ApiPropertyOptional({ enum: AdFormatDto, default: AdFormatDto.RESPONSIVE })
  @IsOptional()
  @IsEnum(AdFormatDto)
  format?: AdFormatDto;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  slotId?: string;

  @ApiPropertyOptional({ example: 'ca-pub-1234567890123456' })
  @IsOptional()
  @IsString()
  clientOrPublisherId?: string;

  @ApiPropertyOptional({ example: '<div class="sponsor">...</div>' })
  @IsOptional()
  @IsString()
  customHtml?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  customImage?: string;

  @ApiPropertyOptional({ example: 'https://partner.com/?ref=nexus' })
  @IsOptional()
  @IsString()
  customUrl?: string;

  @ApiPropertyOptional({ example: 'Sponsored by Neon Database' })
  @IsOptional()
  @IsString()
  customAlt?: string;

  @ApiPropertyOptional({ example: ['/login', '/register', '/admin'] })
  @IsOptional()
  @IsArray()
  excludePaths?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  order?: number;
}
