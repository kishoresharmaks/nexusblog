import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Header,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { CreateAdPlacementDto } from './dto/create-ad-placement.dto';
import { UpdateAdPlacementDto } from './dto/update-ad-placement.dto';
import { UpdateGlobalAdsConfigDto, UpdateAdsTxtDto, TrackAdEventDto } from './dto/update-global-ads-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Ad Monetization & Placements')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  @Public()
  @Get('public/config')
  @ApiOperation({ summary: 'Get public ad configuration for web clients' })
  getPublicConfig() {
    return this.adsService.getPublicConfig();
  }

  @Public()
  @Get('public/placements')
  @ApiOperation({ summary: 'Get all active ad placements for rendering' })
  getPublicPlacements() {
    return this.adsService.getPublicPlacements();
  }

  @Public()
  @Get('public/ads-txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Get dynamic ads.txt content' })
  getAdsTxt() {
    return this.adsService.getAdsTxtContent();
  }

  @Public()
  @Post('public/track-impression')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  @ApiOperation({ summary: 'Track ad placement impression' })
  trackImpression(@Body() dto: TrackAdEventDto) {
    return this.adsService.trackImpression(dto);
  }

  @Public()
  @Post('public/track-click')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  @ApiOperation({ summary: 'Track ad placement click' })
  trackClick(@Body() dto: TrackAdEventDto) {
    return this.adsService.trackClick(dto);
  }

  // ==========================================
  // ADMIN CONTROL ENDPOINTS
  // ==========================================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Get('admin/placements')
  @ApiOperation({ summary: 'Get all ad placements with CTR analytics (Admin)' })
  getAdminPlacements() {
    return this.adsService.getAdminPlacements();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Post('admin/placements')
  @ApiOperation({ summary: 'Create a new ad placement (Admin)' })
  createPlacement(@Body() dto: CreateAdPlacementDto) {
    return this.adsService.createPlacement(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Put('admin/placements/:id')
  @ApiOperation({ summary: 'Update an ad placement by ID (Admin)' })
  updatePlacement(@Param('id') id: string, @Body() dto: UpdateAdPlacementDto) {
    return this.adsService.updatePlacement(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Delete('admin/placements/:id')
  @ApiOperation({ summary: 'Delete an ad placement by ID (Admin)' })
  deletePlacement(@Param('id') id: string) {
    return this.adsService.deletePlacement(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Get('admin/config')
  @ApiOperation({ summary: 'Get raw global ads configuration settings (Admin)' })
  getAdminConfig() {
    return this.adsService.getAdminGlobalConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Put('admin/config')
  @ApiOperation({ summary: 'Update global ads configuration settings (Admin)' })
  updateAdminConfig(@Body() dto: UpdateGlobalAdsConfigDto) {
    return this.adsService.updateAdminGlobalConfig(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Put('admin/ads-txt')
  @ApiOperation({ summary: 'Update dynamic ads.txt content (Admin)' })
  updateAdsTxt(@Body() dto: UpdateAdsTxtDto) {
    return this.adsService.updateAdsTxtContent(dto);
  }
}
