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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GuestPostStatus } from '@prisma/client';

@ApiTags('Guest Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('guest-posts')
export class GuestPostsController {
  constructor(private readonly guestPostsService: GuestPostsService) {}

  @Get('me')
  @ApiOperation({ summary: "Get current contributor's guest post submissions" })
  @ApiQuery({ name: 'status', enum: GuestPostStatus, required: false })
  getUserSubmissions(
    @CurrentUser('id') userId: string,
    @Query('status') status?: GuestPostStatus,
  ) {
    return this.guestPostsService.getUserSubmissions(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific guest post submission' })
  getSubmissionById(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR';
    return this.guestPostsService.getSubmissionById(userId, id, isAdmin);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new guest post draft or submit for review' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGuestPostDto,
  ) {
    return this.guestPostsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft or resubmit revised article' })
  update(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuestPostDto,
  ) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'EDITOR';
    return this.guestPostsService.update(userId, id, dto, isAdmin);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a guest post submission/draft' })
  delete(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
    return this.guestPostsService.delete(userId, id, isAdmin);
  }
}
