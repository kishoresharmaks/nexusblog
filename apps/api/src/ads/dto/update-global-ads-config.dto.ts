import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGlobalAdsConfigDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ads_global_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ads_google_adsense_enabled?: boolean;

  @ApiPropertyOptional({ example: 'ca-pub-1234567890123456' })
  @IsOptional()
  @IsString()
  ads_google_adsense_client_id?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ads_google_adsense_auto_ads?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ads_carbon_enabled?: boolean;

  @ApiPropertyOptional({ example: 'CEBD42Q' })
  @IsOptional()
  @IsString()
  ads_carbon_serve_id?: string;

  @ApiPropertyOptional({ example: 'nexusblog' })
  @IsOptional()
  @IsString()
  ads_carbon_placement?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ads_ethical_ads_enabled?: boolean;

  @ApiPropertyOptional({ example: 'nexus-publisher' })
  @IsOptional()
  @IsString()
  ads_ethical_ads_publisher_id?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ads_adsterra_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ads_hide_for_logged_in?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  ads_interstitial_enabled?: boolean;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  ads_interstitial_timer_seconds?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  ads_interstitial_frequency_minutes?: number;

  @ApiPropertyOptional({ example: 'ADSTERRA' })
  @IsOptional()
  @IsString()
  ads_interstitial_network?: string;

  @ApiPropertyOptional({ example: '<script...></script>' })
  @IsOptional()
  @IsString()
  ads_interstitial_custom_html?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/...' })
  @IsOptional()
  @IsString()
  ads_interstitial_custom_image?: string;

  @ApiPropertyOptional({ example: 'https://partner.com' })
  @IsOptional()
  @IsString()
  ads_interstitial_custom_url?: string;

  @ApiPropertyOptional({ example: 'Sponsored Architecture Briefing' })
  @IsOptional()
  @IsString()
  ads_interstitial_title?: string;

  @ApiPropertyOptional({ example: 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0' })
  @IsOptional()
  @IsString()
  ads_txt_content?: string;
}

export class UpdateAdsTxtDto {
  @ApiPropertyOptional({ example: 'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0' })
  @IsString()
  ads_txt_content!: string;
}

export class TrackAdEventDto {
  @ApiPropertyOptional({ example: 'article-header' })
  @IsString()
  placementSlug!: string;

  @ApiPropertyOptional({ example: 'v_visitor_123' })
  @IsOptional()
  @IsString()
  visitorId?: string;

  @ApiPropertyOptional({ example: '/articles/distributed-rate-limiter' })
  @IsOptional()
  @IsString()
  path?: string;
}
