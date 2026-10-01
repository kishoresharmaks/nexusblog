import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            difficulty: true,
            type: true,
            readingTime: true,
            publishedAt: true,
            viewsCount: true,
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

    return bookmarks.map((b) => ({
      bookmarkId: b.id,
      savedAt: b.createdAt,
      article: b.article,
    }));
  }

  async toggleBookmark(userId: string, articleId: string) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.bookmark.delete({
          where: { id: existing.id },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: { bookmarksCount: { decrement: 1 } },
        }),
      ]);
      return { bookmarked: false, message: 'Bookmark removed' };
    } else {
      await this.prisma.$transaction([
        this.prisma.bookmark.create({
          data: {
            userId,
            articleId,
          },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: { bookmarksCount: { increment: 1 } },
        }),
      ]);
      return { bookmarked: true, message: 'Article bookmarked' };
    }
  }

  async removeBookmark(userId: string, articleId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!existing) {
      return { bookmarked: false, message: 'Bookmark not found' };
    }

    await this.prisma.$transaction([
      this.prisma.bookmark.delete({
        where: { id: existing.id },
      }),
      this.prisma.article.update({
        where: { id: articleId },
        data: { bookmarksCount: { decrement: 1 } },
      }),
    ]);

    return { bookmarked: false, message: 'Bookmark removed' };
  }

  async isBookmarked(userId: string, articleId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    return { bookmarked: !!existing };
  }
}
