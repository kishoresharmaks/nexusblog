import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ReadingHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserHistory(userId: string) {
    const history = await this.prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { lastViewedAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            readingTime: true,
            difficulty: true,
            type: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
              },
            },
            technologies: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return history.map((item) => ({
      id: item.id,
      historyId: item.id,
      userId: item.userId,
      articleId: item.articleId,
      completionPercentage: item.completionPercentage,
      lastPosition: item.lastPosition,
      lastViewedAt: item.lastViewedAt,
      article: item.article,
    }));
  }

  async getArticleProgress(userId: string, articleId: string) {
    const history = await this.prisma.readingHistory.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!history) {
      return { completionPercentage: 0, lastPosition: 0 };
    }

    return {
      id: history.id,
      historyId: history.id,
      completionPercentage: history.completionPercentage,
      lastPosition: history.lastPosition,
      lastViewedAt: history.lastViewedAt,
    };
  }

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const existing = await this.prisma.readingHistory.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: dto.articleId,
        },
      },
    });

    const completionPercentage = existing
      ? Math.max(existing.completionPercentage, dto.completionPercentage)
      : dto.completionPercentage;

    return this.prisma.readingHistory.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId: dto.articleId,
        },
      },
      update: {
        completionPercentage,
        ...(dto.lastPosition !== undefined && { lastPosition: dto.lastPosition }),
        lastViewedAt: new Date(),
      },
      create: {
        userId,
        articleId: dto.articleId,
        completionPercentage: dto.completionPercentage,
        lastPosition: dto.lastPosition ?? 0,
        lastViewedAt: new Date(),
      },
    });
  }

  async removeFromHistory(userId: string, articleId: string) {
    await this.prisma.readingHistory.deleteMany({
      where: {
        userId,
        articleId,
      },
    });

    return { message: 'Removed from reading history' };
  }

  async clearHistory(userId: string) {
    await this.prisma.readingHistory.deleteMany({
      where: { userId },
    });

    return { message: 'Reading history cleared' };
  }
}
