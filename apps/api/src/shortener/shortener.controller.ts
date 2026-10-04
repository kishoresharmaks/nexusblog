import { Controller, Post, Get, Body, Param, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ShortenerService, GenerateShortUrlDto, SyncAllOptions } from './shortener.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('URL Shortener')
@Controller('shortener')
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Public()
  @Post('generate')
  @ApiOperation({ summary: 'Generate or retrieve permanent short article URL with health check probe' })
  generate(@Body() dto: GenerateShortUrlDto) {
    return this.shortenerService.generateShortUrl(dto);
  }

  @Public()
  @Get('s/:code')
  @ApiOperation({ summary: 'Resolve native internal short code (/s/:code) and redirect to canonical article' })
  async resolveNativeCode(@Param('code') code: string, @Res() res: Response) {
    const { destinationUrl } = await this.shortenerService.resolveNativeShortCode(code);
    return res.redirect(HttpStatus.PERMANENT_REDIRECT, destinationUrl);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Post('test-connection')
  @ApiOperation({ summary: 'Test URL shortener provider connection (Admin)' })
  testConnection(
    @Body()
    body: {
      provider: string;
      apiKey?: string;
      customDomain?: string;
      workspaceId?: string;
      customEndpoint?: string;
      customMethod?: string;
      customHeaders?: string;
      customBodyTemplate?: string;
      customResponsePath?: string;
    },
  ) {
    return this.shortenerService.testConnection(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Post('admin/sync-all')
  @ApiOperation({ summary: 'Bulk sync, health check & backfill short links for all published articles (Admin)' })
  syncAllArticles(@Body() body: SyncAllOptions) {
    return this.shortenerService.syncAllArticles(body);
  }
}
