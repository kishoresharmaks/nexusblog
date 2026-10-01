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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get published public articles with filtering and pagination' })
  findPublicFeed(@Query() query: QueryArticleDto) {
    return this.articlesService.findPublicFeed(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  @ApiOperation({ summary: 'Get public article by slug with views increment' })
  findPublicBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.articlesService.findPublicBySlug(slug, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new technical article (Staff)' })
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser('id') authorId: string,
  ) {
    return this.articlesService.create(dto, authorId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an article by ID (Author or Staff)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.articlesService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an article by ID (Author or Staff)' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.articlesService.delete(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark status for logged-in user' })
  toggleBookmark(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.articlesService.toggleBookmark(id, userId);
  }

  @Public()
  @Post(':id/like')
  @ApiOperation({ summary: 'Increment like count on article' })
  toggleLike(@Param('id') id: string) {
    return this.articlesService.toggleLike(id);
  }
}
