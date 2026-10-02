import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Public()
  @Get('public')
  @ApiOperation({ summary: 'Get public system runtime parameters (maintenance mode, branding)' })
  getPublic() {
    return this.systemSettingsService.getPublicSettings();
  }

  @Get('admin/all')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get all system and dev configuration settings' })
  getAll() {
    return this.systemSettingsService.getAllSettings();
  }

  @Patch('admin/batch')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Batch update system and dev configuration settings' })
  updateBatch(@Body() updates: Record<string, any>) {
    return this.systemSettingsService.updateBatch(updates);
  }

  @Post('admin/verify-brevo')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Test and verify Brevo API connection' })
  verifyBrevo(@Body('apiKey') apiKey?: string) {
    return this.systemSettingsService.testBrevoConnection(apiKey);
  }

  @Post('admin/test-mail')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Dispatch a test email via Brevo' })
  testMail(@Body('recipientEmail') recipientEmail: string) {
    return this.systemSettingsService.sendTestMail(recipientEmail);
  }

  @Get('admin/diagnostics')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Get live platform, database and mail health diagnostics' })
  getDiagnostics() {
    return this.systemSettingsService.getSystemDiagnostics();
  }

  @Post('admin/reset-defaults')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Reset developer settings to default parameters' })
  resetDefaults() {
    return this.systemSettingsService.resetDefaults();
  }
}
