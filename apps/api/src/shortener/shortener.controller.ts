import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShortenerService, GenerateShortUrlDto } from './shortener.service';
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
  @ApiOperation({ summary: 'Generate shortened article share URL with fallback and memory caching' })
  generate(@Body() dto: GenerateShortUrlDto) {
    return this.shortenerService.generateShortUrl(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Post('test-connection')
  @ApiOperation({ summary: 'Test third-party shortener API connection (Admin)' })
  testConnection(
    @Body()
    body: {
      provider: string;
      apiKey: string;
      customDomain?: string;
      workspaceId?: string;
    },
  ) {
    return this.shortenerService.testConnection(body);
  }
}
