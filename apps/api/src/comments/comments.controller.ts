import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all comments for admin moderation' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  getAllAdminComments(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.commentsService.getAllAdminComments(status, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Patch('admin/:id/status')
  @ApiOperation({ summary: 'Update comment moderation status' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.commentsService.updateStatus(id, status);
  }

  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get all approved comments for an article' })
  getArticleComments(@Param('articleId') articleId: string) {
    return this.commentsService.getArticleComments(articleId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get all comments posted by the authenticated user' })
  getUserComments(@CurrentUser('id') userId: string) {
    return this.commentsService.getUserComments(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a comment or reply to an existing comment' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Edit an existing comment by ID' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  delete(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    return this.commentsService.delete(userId, id, isAdmin);
  }
}
