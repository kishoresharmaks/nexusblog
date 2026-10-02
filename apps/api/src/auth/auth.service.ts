import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async generateTokens(user: { id: string; email: string; username: string; role: Role }) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ||
        'nexus-access-secret-super-secure-change-in-production-12345',
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m') as any,
    });

    const rawRefreshToken = this.generateSecureToken();
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    return {
      accessToken,
      rawRefreshToken,
      refreshTokenHash,
    };
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { username: dto.username.toLowerCase() }],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email.toLowerCase()) {
        throw new ConflictException('An account with this email already exists');
      }
      throw new ConflictException('Username is already taken');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Count existing users to assign SUPER_ADMIN to the very first user
    const userCount = await this.prisma.user.count();
    const initialRole: Role = userCount === 0 ? 'SUPER_ADMIN' : 'USER';

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username.toLowerCase(),
        email: dto.email.toLowerCase(),
        passwordHash,
        avatar: dto.avatar,
        bio: dto.bio,
        role: initialRole,
        emailVerified: userCount === 0, // Auto-verify first super admin
      },
    });

    const { accessToken, rawRefreshToken, refreshTokenHash } = await this.generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    await this.recordAuditLog(
      user.id,
      'USER_REGISTERED',
      'User',
      user.id,
      { role: user.role, email: user.email },
      ipAddress,
      userAgent,
    );

    const safeUser = this.sanitizeUser(user);
    return {
      user: safeUser,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    const isValidPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!isValidPassword) {
      await this.recordAuditLog(
        user.id,
        'FAILED_LOGIN_ATTEMPT',
        'User',
        user.id,
        { email: dto.email },
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const { accessToken, rawRefreshToken, refreshTokenHash } = await this.generateTokens(user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    await this.recordAuditLog(
      user.id,
      'USER_LOGGED_IN',
      'User',
      user.id,
      { role: user.role },
      ipAddress,
      userAgent,
    );

    const safeUser = this.sanitizeUser(user);
    return {
      user: safeUser,
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  async refreshSession(rawRefreshToken: string, ipAddress?: string, userAgent?: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = this.hashToken(rawRefreshToken);

    let session = await this.prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    // Handle concurrent / React StrictMode race condition: allow 30-second grace period for recently rotated sessions
    if (!session) {
      const gracePeriodCutoff = new Date(Date.now() - 30 * 1000);
      const recentlyRevoked = await this.prisma.session.findFirst({
        where: {
          refreshTokenHash,
          revokedAt: { gte: gracePeriodCutoff },
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (recentlyRevoked && recentlyRevoked.user && recentlyRevoked.user.status !== 'SUSPENDED') {
        const { accessToken } = await this.generateTokens(recentlyRevoked.user);
        return {
          user: this.sanitizeUser(recentlyRevoked.user),
          accessToken,
          refreshToken: rawRefreshToken,
        };
      }

      throw new UnauthorizedException('Session is invalid or has expired');
    }

    if (!session.user || session.user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Session is invalid or has expired');
    }

    // Revoke old session (Rotation Guarantee)
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // Create new rotated tokens & session
    const { accessToken, rawRefreshToken: newRawRefreshToken, refreshTokenHash: newRefreshTokenHash } =
      await this.generateTokens(session.user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: session.user.id,
        refreshTokenHash: newRefreshTokenHash,
        userAgent: userAgent || session.userAgent,
        ipAddress: ipAddress || session.ipAddress,
        expiresAt,
      },
    });

    return {
      user: this.sanitizeUser(session.user),
      accessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken: string) {
    if (rawRefreshToken) {
      const refreshTokenHash = this.hashToken(rawRefreshToken);
      await this.prisma.session.updateMany({
        where: { refreshTokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async logoutAllSessions(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'All active sessions have been revoked' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.github !== undefined && { github: dto.github }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
      },
    });

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all other sessions for security
    await this.logoutAllSessions(userId);

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If that email address exists in our system, a password reset link has been sent.' };
    }

    const rawToken = this.generateSecureToken();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    this.logger.log(`🔑 Password Reset Token for ${user.email}: ${rawToken}`);

    return { message: 'If that email address exists in our system, a password reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);

    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.user.update({
      where: { id: resetRequest.userId },
      data: { passwordHash: newPasswordHash },
    });

    await this.prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all active sessions for security
    await this.logoutAllSessions(resetRequest.userId);

    return { message: 'Password reset successful. You can now log in with your new password.' };
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  private async recordAuditLog(
    userId: string | null,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details: details ? (details as any) : undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (e) {
      this.logger.warn(`AuditLog record failed: ${(e as Error).message}`);
    }
  }
}
