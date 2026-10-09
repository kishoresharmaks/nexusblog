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
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private parseDurationToMs(duration?: string, defaultMs = 7 * 24 * 60 * 60 * 1000): number {
    if (!duration) return defaultMs;
    const match = duration.toString().trim().match(/^(\d+)([smhdwy]?)$/i);
    if (!match) return defaultMs;
    const val = parseInt(match[1], 10);
    const unit = (match[2] || 'ms').toLowerCase();
    switch (unit) {
      case 's': return val * 1000;
      case 'm': return val * 60 * 1000;
      case 'h': return val * 60 * 60 * 1000;
      case 'd': return val * 24 * 60 * 60 * 1000;
      case 'w': return val * 7 * 24 * 60 * 60 * 1000;
      case 'y': return val * 365 * 24 * 60 * 60 * 1000;
      default: return val;
    }
  }

  private getRefreshTokenExpiry(): Date {
    const duration =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
      process.env.JWT_REFRESH_EXPIRES_IN ||
      '7d';
    const ms = this.parseDurationToMs(duration, 7 * 24 * 60 * 60 * 1000);
    return new Date(Date.now() + ms);
  }

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
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedUsername = dto.username.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
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

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        avatar: dto.avatar,
        bio: dto.bio,
        role: 'USER',
        emailVerified: false,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Generate email verification token for non-superadmins
    if (!user.emailVerified) {
      const rawVerificationToken = this.generateSecureToken();
      const verificationTokenHash = this.hashToken(rawVerificationToken);

      const verificationExpiresAt = new Date();
      verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 24); // 24-hour validity

      await this.prisma.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash: verificationTokenHash,
          expiresAt: verificationExpiresAt,
        },
      });

      // Dispatch verification email via Brevo asynchronously (non-blocking)
      this.mailService
        .sendVerificationEmail(user.email, user.name, rawVerificationToken)
        .catch((err) => {
          this.logger.error(`[AuthService] Failed to dispatch verification email to ${user.email}: ${err.message}`);
        });
    }

    const { accessToken, rawRefreshToken, refreshTokenHash } = await this.generateTokens(user);

    const expiresAt = this.getRefreshTokenExpiry();

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

    const expiresAt = this.getRefreshTokenExpiry();

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

    const expiresAt = this.getRefreshTokenExpiry();

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

  async verifyEmail(token: string) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new BadRequestException('Verification token is required');
    }

    const tokenHash = this.hashToken(token.trim());

    const verification = await this.prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!verification || verification.usedAt || verification.expiresAt < new Date()) {
      throw new BadRequestException('Email verification link is invalid, expired, or has already been used.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: {
          emailVerified: true,
          status: verification.user.status === 'PENDING_VERIFICATION' ? 'ACTIVE' : verification.user.status,
        },
      }),
      this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await this.recordAuditLog(
      verification.userId,
      'EMAIL_VERIFIED',
      'User',
      verification.userId,
      { email: verification.user.email },
    );

    return {
      success: true,
      message: 'Your email address has been successfully verified! You now have full access to NexusNation.',
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    if (user.status === 'SUSPENDED') {
      throw new BadRequestException('Your account is suspended. Please contact support.');
    }

    if (user.emailVerified) {
      throw new BadRequestException('This email address is already verified. You can log in directly.');
    }

    // Invalidate previous unused verification tokens
    await this.prisma.emailVerification.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Generate new secure verification token
    const rawVerificationToken = this.generateSecureToken();
    const verificationTokenHash = this.hashToken(rawVerificationToken);

    const verificationExpiresAt = new Date();
    verificationExpiresAt.setHours(verificationExpiresAt.getHours() + 24);

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        tokenHash: verificationTokenHash,
        expiresAt: verificationExpiresAt,
      },
    });

    // Dispatch email via Brevo
    try {
      await this.mailService.sendVerificationEmail(user.email, user.name, rawVerificationToken);
    } catch (err: any) {
      this.logger.error(`[AuthService] Failed to dispatch resend verification email to ${user.email}: ${err.message}`);
    }

    return {
      message: 'A new verification link has been sent to your email address.',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('No account found with this email address');
    }

    if (user.status === 'SUSPENDED') {
      throw new BadRequestException('Your account is suspended. Please contact support.');
    }

    // Invalidate previous unused password reset tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

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

    // Dispatch password reset email via Brevo
    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.name, rawToken);
    } catch (err: any) {
      this.logger.error(`[AuthService] Failed to dispatch password reset email to ${user.email}: ${err.message}`);
    }

    return {
      message: 'A password reset link has been sent to your email address.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.token || dto.token.trim().length === 0) {
      throw new BadRequestException('Reset token is required');
    }

    const tokenHash = this.hashToken(dto.token.trim());

    const resetRequest = await this.prisma.passwordReset.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRequest || resetRequest.usedAt || resetRequest.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token is invalid or has expired');
    }

    if (!resetRequest.user) {
      throw new NotFoundException('User associated with this reset token no longer exists');
    }

    if (resetRequest.user.status === 'SUSPENDED') {
      throw new BadRequestException('Your account is suspended. Please contact support.');
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const newPasswordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRequest.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRequest.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Invalidate all active sessions for security
    await this.logoutAllSessions(resetRequest.userId);

    // Dispatch security alert email
    this.mailService
      .sendPasswordChangedAlert(resetRequest.user.email, resetRequest.user.name)
      .catch((err) => {
        this.logger.error(`[AuthService] Failed to dispatch password changed alert to ${resetRequest.user.email}: ${err.message}`);
      });

    await this.recordAuditLog(
      resetRequest.userId,
      'PASSWORD_RESET_COMPLETED',
      'User',
      resetRequest.userId,
      { email: resetRequest.user.email },
    );

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
