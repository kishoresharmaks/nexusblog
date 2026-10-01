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
      historyId: item.id,
      completionPercentage: item.completionPercentage,
      lastPosition: item.lastPosition,
      lastViewedAt: item.lastViewedAt,
      article: item.article,
    }));
  }

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.prisma.readingHistory.upsert({
      where: {
        userId_articleId: {
          userId,
          articleId: dto.articleId,
        },
      },
      update: {
        completionPercentage: dto.completionPercentage,
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
