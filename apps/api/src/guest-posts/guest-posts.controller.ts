import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GuestPostsService } from './guest-posts.service';
import { CreateGuestPostDto } from './dto/create-guest-post.dto';
import { UpdateGuestPostDto } from './dto/update-guest-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GuestPostStatus } from '@prisma/client';

@ApiTags('Guest Posts')
@Controller('guest-posts')
export class GuestPostsController {
  constructor(private readonly guestPostsService: GuestPostsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Get('admin/queue')
  @ApiOperation({ summary: 'List all guest posts for moderation (Staff only)' })
  @ApiQuery({ name: 'status', enum: GuestPostStatus, required: false })
  getModerationQueue(@Query('status') status?: GuestPostStatus) {
    return this.guestPostsService.findAllForModeration(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @Patch('admin/:id/moderate')
  @ApiOperation({ summary: 'Moderate a guest post (Approve, Request Changes, Reject)' })
  moderateSubmission(
    @Param('id') id: string,
    @Body('action') action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT',
    @Body('feedback') feedback?: string,
    @CurrentUser('id') reviewerId?: string,
  ) {
    return this.guestPostsService.moderateSubmission(id, action, feedback, reviewerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: "Get current contributor's guest post submissions" })
  @ApiQuery({ name: 'status', enum: GuestPostStatus, required: false })
  getUserSubmissions(
    @CurrentUser('id') userId: string,
    @Query('status') status?: GuestPostStatus,
  ) {
    return this.guestPostsService.getUserSubmissions(userId, status);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific guest post submission (Token or Auth)' })
  @ApiQuery({ name: 'token', required: false, description: 'Secret edit token for anonymous posts' })
  getSubmissionById(
    @Param('id') id: string,
    @Query('token') token?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin =
      user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EDITOR';
    return this.guestPostsService.getSubmissionById(user?.id, id, token, isAdmin);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new guest post draft or submit for review' })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateGuestPostDto,
  ) {
    return this.guestPostsService.create(user?.id, dto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft or resubmit revised article' })
  @ApiQuery({ name: 'token', required: false, description: 'Secret edit token for anonymous posts' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGuestPostDto,
    @Query('token') token?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin =
      user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'EDITOR';
    return this.guestPostsService.update(user?.id, id, dto, token, isAdmin);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guest post submission/draft' })
  @ApiQuery({ name: 'token', required: false, description: 'Secret edit token for anonymous posts' })
  delete(
    @Param('id') id: string,
    @Query('token') token?: string,
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    return this.guestPostsService.delete(user?.id, id, token, isAdmin);
  }
}

