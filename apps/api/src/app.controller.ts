import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'API Health Check' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Post('telemetry/pageview')
  @HttpCode(200)
  @ApiOperation({ summary: 'Pageview Telemetry Ping' })
  trackPageview() {
    return { success: true };
  }
}
