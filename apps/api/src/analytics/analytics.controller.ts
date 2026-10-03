import { Controller, Get, Post, Body, Query, Ip, Headers, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CollectEventDto, SearchQueryDto } from './dto/collect-event.dto';

@ApiTags('Analytics & Telemetry')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('collect')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  @ApiOperation({ summary: 'Ingest non-blocking client beacon telemetry event' })
  @ApiResponse({ status: 200, description: 'Event ingested successfully' })
  async collectEvent(
    @Body() dto: CollectEventDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.analyticsService.collectEvent(dto, ip, userAgent);
  }

  @Post('search-query')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  @ApiOperation({ summary: 'Log on-site search query for search intelligence' })
  @ApiResponse({ status: 200, description: 'Search query logged' })
  async logSearchQuery(@Body() dto: SearchQueryDto) {
    return this.analyticsService.logSearchQuery(dto);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get aggregated overview KPIs and time-series traffic curve' })
  @ApiQuery({ name: 'timeWindow', required: false, enum: ['24h', '7d', '30d', '90d', 'all'] })
  async getOverview(@Query('timeWindow') timeWindow?: string) {
    return this.analyticsService.getOverview(timeWindow || '7d');
  }

  @Get('blueprints')
  @ApiOperation({ summary: 'Get top performing architecture blueprints leaderboard' })
  @ApiQuery({ name: 'timeWindow', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopBlueprints(
    @Query('timeWindow') timeWindow?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getTopBlueprints(timeWindow || '7d', limit ? Number(limit) : 10);
  }

  @Get('tech-and-geo')
  @ApiOperation({ summary: 'Get category, stack, OS, browser, device, and geo distribution' })
  @ApiQuery({ name: 'timeWindow', required: false })
  async getTechAndGeo(@Query('timeWindow') timeWindow?: string) {
    return this.analyticsService.getTechAndGeo(timeWindow || '7d');
  }

  @Get('search-intelligence')
  @ApiOperation({ summary: 'Get top search queries and zero-result content gap analysis' })
  @ApiQuery({ name: 'timeWindow', required: false })
  async getSearchIntelligence(@Query('timeWindow') timeWindow?: string) {
    return this.analyticsService.getSearchIntelligence(timeWindow || '7d');
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get active live readers pulse and active reading pages' })
  async getRealtime() {
    return this.analyticsService.getRealtimePulse();
  }
}
