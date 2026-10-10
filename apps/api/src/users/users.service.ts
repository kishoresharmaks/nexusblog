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
      socialLinks: {
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
      },
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
              where: { status: 'PUBLISHED', type: { not: 'INCIDENT' } },
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
      socialLinks: {
        website: user.website || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
      },
      stats: {
        articlesCount: user._count.articles,
      },
    };
  }

  async getPublicAuthors() {
    return this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        articles: {
          some: { status: 'PUBLISHED', type: { not: 'INCIDENT' } },
        },
      },
      select: {
        username: true,
        updatedAt: true,
      },
      orderBy: { username: 'asc' },
    });
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const website = dto.socialLinks?.website !== undefined ? dto.socialLinks.website : dto.website;
    const github = dto.socialLinks?.github !== undefined ? dto.socialLinks.github : dto.github;
    const linkedin = dto.socialLinks?.linkedin !== undefined ? dto.socialLinks.linkedin : dto.linkedin;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(website !== undefined && { website }),
        ...(github !== undefined && { github }),
        ...(linkedin !== undefined && { linkedin }),
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

    return {
      ...updated,
      socialLinks: {
        website: updated.website || '',
        github: updated.github || '',
        linkedin: updated.linkedin || '',
      },
    };
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

  async reassignArticles(sourceUserId: string, targetUserId: string) {
    if (!targetUserId || sourceUserId === targetUserId) {
      throw new BadRequestException('Please select a different target author');
    }

    const [sourceUser, targetUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: sourceUserId } }),
      this.prisma.user.findUnique({ where: { id: targetUserId } }),
    ]);

    if (!sourceUser) {
      throw new NotFoundException('Source user not found');
    }
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const updated = await this.prisma.article.updateMany({
      where: { authorId: sourceUserId },
      data: { authorId: targetUserId },
    });

    return {
      success: true,
      message: `Successfully reassigned ${updated.count} article(s) from @${sourceUser.username} to @${targetUser.username}`,
      count: updated.count,
    };
  }

  async deleteUser(userId: string, reassignToUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'SUPER_ADMIN') {
      const superAdminCount = await this.prisma.user.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot delete the last remaining Super Admin account');
      }
    }

    if (user._count.articles > 0) {
      if (!reassignToUserId) {
        throw new BadRequestException(
          `Cannot delete user "${user.name}" (@${user.username}) because they have authored ${user._count.articles} article(s). Please select an author to reassign their articles to, or set their account status to DEACTIVATED or SUSPENDED.`,
        );
      }

      if (reassignToUserId === userId) {
        throw new BadRequestException('Cannot reassign articles to the user being deleted');
      }

      const targetAuthor = await this.prisma.user.findUnique({
        where: { id: reassignToUserId },
      });

      if (!targetAuthor) {
        throw new NotFoundException('Target replacement author not found');
      }

      // Reassign all articles to target author
      await this.prisma.article.updateMany({
        where: { authorId: userId },
        data: { authorId: reassignToUserId },
      });
    }

    // Safely clean up dependent records in a transaction
    await this.prisma.$transaction([
      this.prisma.session.deleteMany({ where: { userId } }),
      this.prisma.emailVerification.deleteMany({ where: { userId } }),
      this.prisma.passwordReset.deleteMany({ where: { userId } }),
      this.prisma.bookmark.deleteMany({ where: { userId } }),
      this.prisma.readingHistory.deleteMany({ where: { userId } }),
      this.prisma.comment.deleteMany({ where: { userId } }),
      this.prisma.guestPost.updateMany({
        where: { authorId: userId },
        data: { authorId: null },
      }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { success: true, message: `User @${user.username} has been successfully removed` };
  }
}
