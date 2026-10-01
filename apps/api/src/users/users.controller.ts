import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
