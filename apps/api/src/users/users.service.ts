import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileWithStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        website: true,
        github: true,
        linkedin: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookmarks: true,
            readingHistories: true,
            comments: true,
            guestPosts: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      ...user,
      stats: {
        bookmarksCount: user._count.bookmarks,
        readingHistoryCount: user._count.readingHistories,
        commentsCount: user._count.comments,
        guestPostsCount: user._count.guestPosts,
      },
    };
  }

  async getPublicAuthor(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        website: true,
        github: true,
        linkedin: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Author profile not found');
    }

    return {
      ...user,
      stats: {
        articlesCount: user._count.articles,
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.github !== undefined && { github: dto.github }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        website: true,
        github: true,
        linkedin: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  }

  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastUsedAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Session revoked successfully' };
  }

  async revokeAllOtherSessions(userId: string, exceptSessionId?: string) {
    await this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });

    return { message: 'All other active sessions have been revoked' };
  }

  async getAdminUsers(query: { search?: string; role?: any; limit?: number; offset?: number }) {
    const limit = query.limit || 50;
    const offset = query.offset || 0;

    const where: any = {};
    if (query.role && query.role !== 'ALL') {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              articles: true,
              comments: true,
              guestPosts: true,
              bookmarks: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        ...u,
        articlesCount: u._count.articles,
        commentsCount: u._count.comments,
        guestPostsCount: u._count.guestPosts,
        bookmarksCount: u._count.bookmarks,
      })),
      total,
      limit,
      offset,
    };
  }

  async updateUserRole(userId: string, role: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async updateUserStatus(userId: string, status: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'User removed successfully' };
  }
}

