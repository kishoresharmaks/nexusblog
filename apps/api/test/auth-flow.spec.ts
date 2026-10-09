import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/auth/auth.service';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

describe('Production Authentication & Brevo Email Flow (AuthService)', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockMailService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      session: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      emailVerification: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      passwordReset: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn().mockImplementation((promises) => Promise.all(promises)),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('mock-access-token-jwt'),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') return 'test-jwt-secret-xyz';
        if (key === 'JWT_ACCESS_EXPIRES_IN') return '15m';
        return null;
      }),
    };

    mockMailService = {
      sendVerificationEmail: vi.fn().mockResolvedValue(true),
      sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
      sendPasswordChangedAlert: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(
      mockPrisma,
      mockJwtService,
      mockConfigService,
      mockMailService,
    );
  });

  describe('User Registration Flow', () => {
    it('should register every public signup as an unverified USER', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const fakeCreatedUser = {
        id: 'usr_1',
        email: 'founder@nexusblog.io',
        username: 'founder',
        name: 'Nexus Founder',
        passwordHash: 'hashed_pwd',
        role: 'USER',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
        avatar: null,
        bio: null,
        website: null,
        github: null,
        linkedin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(fakeCreatedUser);
      mockPrisma.emailVerification.create.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await authService.register({
        name: 'Nexus Founder',
        username: 'founder',
        email: 'Founder@NexusBlog.io',
        password: 'Password12345!',
      });

      expect(result.user.email).toBe('founder@nexusblog.io');
      expect(result.user.role).toBe('USER');
      expect(result.user.status).toBe('PENDING_VERIFICATION');
      expect(result.user.emailVerified).toBe(false);
      expect(mockPrisma.user.count).not.toHaveBeenCalled();
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.accessToken).toBe('mock-access-token-jwt');
      expect(result.refreshToken).toBeDefined();
    });

    it('should register subsequent users as USER with PENDING_VERIFICATION and dispatch Brevo verification email', async () => {
      mockPrisma.user.count.mockResolvedValue(5);
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const fakeCreatedUser = {
        id: 'usr_2',
        email: 'reader@example.com',
        username: 'reader',
        name: 'Reader One',
        passwordHash: 'hashed_pwd',
        role: 'USER',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
        avatar: null,
        bio: null,
        website: null,
        github: null,
        linkedin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(fakeCreatedUser);
      mockPrisma.emailVerification.create.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await authService.register({
        name: 'Reader One',
        username: 'reader',
        email: 'reader@example.com',
        password: 'Password12345!',
      });

      expect(result.user.role).toBe('USER');
      expect(result.user.status).toBe('PENDING_VERIFICATION');
      expect(mockPrisma.emailVerification.create).toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        'reader@example.com',
        'Reader One',
        expect.any(String),
      );
    });

    it('should reject registration if email or username is already taken', async () => {
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'usr_existing',
        email: 'taken@example.com',
        username: 'taken',
      });

      await expect(
        authService.register({
          name: 'Taken User',
          username: 'taken',
          email: 'taken@example.com',
          password: 'Password12345!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Login & Authentication Flow', () => {
    it('should successfully log in with valid credentials and return safe user object', async () => {
      const password = 'CorrectPassword123!';
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const user = {
        id: 'usr_active',
        email: 'active@example.com',
        username: 'activeuser',
        name: 'Active User',
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: true,
        avatar: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.session.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await authService.login({
        email: 'active@example.com',
        password,
      });

      expect(result.user.id).toBe('usr_active');
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.accessToken).toBe('mock-access-token-jwt');
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });

    it('should reject login for suspended accounts', async () => {
      const user = {
        id: 'usr_suspended',
        email: 'badactor@example.com',
        username: 'badactor',
        name: 'Bad Actor',
        passwordHash: 'dummy_hash',
        role: 'USER',
        status: 'SUSPENDED',
        emailVerified: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      await expect(
        authService.login({
          email: 'badactor@example.com',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login for invalid password', async () => {
      const passwordHash = await argon2.hash('ActualPassword123!', {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const user = {
        id: 'usr_valid',
        email: 'user@example.com',
        username: 'validuser',
        passwordHash,
        status: 'ACTIVE',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Email Verification Flow', () => {
    it('should verify email and activate user status on valid single-use token', async () => {
      const rawToken = 'test-verification-token-123';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const verificationRecord = {
        id: 'ver_1',
        userId: 'usr_pending',
        tokenHash,
        usedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: {
          id: 'usr_pending',
          email: 'pending@example.com',
          status: 'PENDING_VERIFICATION',
        },
      };

      mockPrisma.emailVerification.findUnique.mockResolvedValue(verificationRecord);
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.emailVerification.update.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await authService.verifyEmail(rawToken);

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should reject expired or already-used verification token', async () => {
      const rawToken = 'expired-token';
      mockPrisma.emailVerification.findUnique.mockResolvedValue({
        id: 'ver_expired',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(authService.verifyEmail(rawToken)).rejects.toThrow(BadRequestException);
    });

    it('should resend verification email only when unverified user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_resend',
        email: 'resend@example.com',
        name: 'Resend User',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
      });
      mockPrisma.emailVerification.updateMany.mockResolvedValue({});
      mockPrisma.emailVerification.create.mockResolvedValue({});

      const res = await authService.resendVerification({ email: 'resend@example.com' });

      expect(res.message).toContain('verification link has been sent');
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        'resend@example.com',
        'Resend User',
        expect.any(String),
      );
    });

    it('should throw NotFoundException when resending verification for non-existent email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.resendVerification({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockMailService.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('Password Reset & Session Revocation Flow', () => {
    it('should check user existence and dispatch password reset email only when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'usr_forgot',
        email: 'forgot@example.com',
        name: 'Forgot User',
        status: 'ACTIVE',
      });
      mockPrisma.passwordReset.updateMany.mockResolvedValue({});
      mockPrisma.passwordReset.create.mockResolvedValue({});

      const res = await authService.forgotPassword({ email: 'forgot@example.com' });

      expect(res.message).toContain('password reset link has been sent');
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'forgot@example.com',
        'Forgot User',
        expect.any(String),
      );
    });

    it('should throw NotFoundException and NOT send email when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.forgotPassword({ email: 'doesnotexist@example.com' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should reset password, invalidate token, and revoke all sessions across all devices', async () => {
      const rawToken = 'valid-reset-token-xyz';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      mockPrisma.passwordReset.findUnique.mockResolvedValue({
        id: 'reset_req_1',
        userId: 'usr_reset',
        tokenHash,
        usedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        user: {
          id: 'usr_reset',
          email: 'resetme@example.com',
          name: 'Reset User',
        },
      });

      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.passwordReset.update.mockResolvedValue({});
      mockPrisma.session.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.auditLog.create.mockResolvedValue({});

      const res = await authService.resetPassword({
        token: rawToken,
        newPassword: 'BrandNewSecurePassword123!',
      });

      expect(res.message).toContain('Password reset successful');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      // Verifies all active sessions are revoked
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { userId: 'usr_reset', revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      // Verifies security alert is sent
      expect(mockMailService.sendPasswordChangedAlert).toHaveBeenCalledWith(
        'resetme@example.com',
        'Reset User',
      );
    });
  });

  describe('Session Management & Token Rotation', () => {
    it('should rotate session refresh token on refreshSession', async () => {
      const rawToken = 'active-refresh-token';
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const mockSession = {
        id: 'sess_1',
        refreshTokenHash: tokenHash,
        userId: 'usr_1',
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
        user: {
          id: 'usr_1',
          email: 'user@example.com',
          status: 'ACTIVE',
          role: 'USER',
          passwordHash: 'hash',
        },
      };

      mockPrisma.session.findFirst.mockResolvedValue(mockSession);
      mockPrisma.session.update.mockResolvedValue({});
      mockPrisma.session.create.mockResolvedValue({});

      const result = await authService.refreshSession(rawToken);

      expect(result.user.id).toBe('usr_1');
      expect(result.accessToken).toBe('mock-access-token-jwt');
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { id: 'sess_1' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should revoke session on logout', async () => {
      const rawToken = 'token-to-logout';
      mockPrisma.session.updateMany.mockResolvedValue({ count: 1 });

      const res = await authService.logout(rawToken);
      expect(res.message).toBe('Logged out successfully');
      expect(mockPrisma.session.updateMany).toHaveBeenCalled();
    });
  });
});
