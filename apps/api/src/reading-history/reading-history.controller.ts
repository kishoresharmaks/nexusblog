import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReadingHistoryService } from './reading-history.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reading History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reading-history')
export class ReadingHistoryController {
  constructor(private readonly readingHistoryService: ReadingHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user reading history with completion percentage' })
  getUserHistory(@CurrentUser('id') userId: string) {
    return this.readingHistoryService.getUserHistory(userId);
  }

  @Get(':articleId')
  @ApiOperation({ summary: 'Get reading history progress for a specific article' })
  getArticleProgress(
    @CurrentUser('id') userId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.readingHistoryService.getArticleProgress(userId, articleId);
  }

  @Post()
  @ApiOperation({ summary: 'Record or update article reading progress' })
  updateProgress(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.readingHistoryService.updateProgress(userId, dto);
  }

  @Delete(':articleId')
  @ApiOperation({ summary: 'Remove a specific article from reading history' })
  removeFromHistory(
    @CurrentUser('id') userId: string,
    @Param('articleId') articleId: string,
  ) {
    return this.readingHistoryService.removeFromHistory(userId, articleId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all reading history for current user' })
  clearHistory(@CurrentUser('id') userId: string) {
    return this.readingHistoryService.clearHistory(userId);
  }
}
