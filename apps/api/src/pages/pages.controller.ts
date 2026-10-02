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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all published CMS & Legal pages' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  findAll(@Query('all') all?: string) {
    const publishedOnly = all !== 'true';
    return this.pagesService.findAll(publishedOnly);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Get('admin/detail/:id')
  @ApiOperation({ summary: 'Get page by ID for admin editing' })
  findById(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get page content by slug (e.g. privacy-policy, terms-of-service)' })
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new static/legal page (Admin/Editor)' })
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update page content & metadata (Admin/Editor)' })
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a page (Admin only)' })
  delete(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }
}
