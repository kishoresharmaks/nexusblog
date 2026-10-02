import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArticleTypesService } from './article-types.service';
import { CreateArticleTypeDto } from './dto/create-article-type.dto';
import { UpdateArticleTypeDto } from './dto/update-article-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Article Types')
@Controller('article-types')
export class ArticleTypesController {
  constructor(private readonly articleTypesService: ArticleTypesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all article types with published article counts' })
  findAll() {
    return this.articleTypesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get article type by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.articleTypesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new article type (Admin/Editor)' })
  create(@Body() dto: CreateArticleTypeDto) {
    return this.articleTypesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an article type by ID (Admin/Editor)' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleTypeDto) {
    return this.articleTypesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article type by ID (Admin only)' })
  delete(@Param('id') id: string) {
    return this.articleTypesService.delete(id);
  }
}
