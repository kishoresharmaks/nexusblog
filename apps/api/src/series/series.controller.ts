import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published technical series' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  findAll(@Query('all') all?: string) {
    const publishedOnly = all !== 'true';
    return this.seriesService.findAll(publishedOnly);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get technical series by slug with ordered articles' })
  findBySlug(@Param('slug') slug: string) {
    return this.seriesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new series (Admin/Editor)' })
  create(@Body() dto: CreateSeriesDto) {
    return this.seriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a series by ID (Admin/Editor)' })
  update(@Param('id') id: string, @Body() dto: UpdateSeriesDto) {
    return this.seriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a series by ID (Admin only)' })
  delete(@Param('id') id: string) {
    return this.seriesService.delete(id);
  }
}
