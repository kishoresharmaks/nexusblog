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
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('admin/list')
  @ApiOperation({ summary: 'List all users with administrative stats (Admin only)' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  getAdminUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.usersService.getAdminUsers({
      search,
      role,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('admin/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.usersService.updateUserRole(id, role);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('admin/:id/status')
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.usersService.updateUserStatus(id, status);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('admin/:id/reassign-articles')
  @ApiOperation({ summary: 'Reassign all articles from one user to another author (Admin only)' })
  reassignArticles(
    @Param('id') sourceUserId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.usersService.reassignArticles(sourceUserId, targetUserId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete user account with optional article reassignment (Admin only)' })
  deleteUser(
    @Param('id') id: string,
    @Query('reassignTo') reassignTo?: string,
  ) {
    return this.usersService.deleteUser(id, reassignTo);
  }

  @Public()
  @Get('authors')
  @ApiOperation({ summary: 'List public profiles with published technical articles' })
  getPublicAuthors() {
    return this.usersService.getPublicAuthors();
  }

  @Public()
  @Get('author/:username')
  @ApiOperation({ summary: 'Get public author profile by username' })
  getPublicAuthor(@Param('username') username: string) {
    return this.usersService.getPublicAuthor(username);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user profile with activity metrics' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfileWithStats(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile information (bio, name, socials)' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List all active sessions for current user' })
  getActiveSessions(@CurrentUser('id') userId: string) {
    return this.usersService.getActiveSessions(userId);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Revoke a specific active session' })
  revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.usersService.revokeSession(userId, sessionId);
  }

  @Delete('sessions')
  @ApiOperation({ summary: 'Revoke all other active sessions' })
  revokeAllOtherSessions(@CurrentUser('id') userId: string) {
    return this.usersService.revokeAllOtherSessions(userId);
  }
}
