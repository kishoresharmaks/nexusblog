import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookmarked articles for the authenticated user' })
  getUserBookmarks(@CurrentUser('id') userId: string) {
    return this.bookmarksService.getUserBookmarks(userId);
  }

  @Get('check/:articleId')
  @ApiOperation({ summary: 'Check if an article is bookmarked by the user' })
  isBookmarked(
    @CurrentUser('id') userId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.bookmarksService.isBookmarked(userId, articleId);
  }

  @Post(':articleId')
  @ApiOperation({ summary: 'Toggle bookmark status for an article' })
  toggleBookmark(
    @CurrentUser('id') userId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.bookmarksService.toggleBookmark(userId, articleId);
  }

  @Delete(':articleId')
  @ApiOperation({ summary: 'Remove an article from user bookmarks' })
  removeBookmark(
    @CurrentUser('id') userId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.bookmarksService.removeBookmark(userId, articleId);
  }
}
