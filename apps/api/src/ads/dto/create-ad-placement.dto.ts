import { IsString, IsEnum, IsOptional, IsArray, IsInt, ArrayMaxSize, MaxLength, Min } from 'class-validator';
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
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'article-header' })
  @IsString()
  @MaxLength(100)
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
  @MaxLength(300)
  slotId?: string;

  @ApiPropertyOptional({ example: 'ca-pub-1234567890123456' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  clientOrPublisherId?: string;

  @ApiPropertyOptional({ example: '<div class="sponsor">...</div>' })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  customHtml?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  customImage?: string;

  @ApiPropertyOptional({ example: 'https://partner.com/?ref=nexus' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  customUrl?: string;

  @ApiPropertyOptional({ example: 'Sponsored by Neon Database' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  customAlt?: string;

  @ApiPropertyOptional({ example: ['/login', '/register', '/admin'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  excludePaths?: string[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
