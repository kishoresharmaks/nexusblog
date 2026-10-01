import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getArticleComments(articleId: string) {
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
        status: { in: ['APPROVED', 'PENDING'] },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Build hierarchy (root comments with nested replies)
    const rootComments: any[] = [];
    const commentMap = new Map<string, any>();

    for (const comment of comments) {
      const item = { ...comment, replies: [] };
      commentMap.set(comment.id, item);
    }

    for (const comment of comments) {
      const item = commentMap.get(comment.id);
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(item);
      } else {
        rootComments.push(item);
      }
    }

    return rootComments;
  }

  async getUserComments(userId: string) {
    return this.prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async create(userId: string, dto: CreateCommentDto) {
    const article = await this.prisma.article.findUnique({
      where: { id: dto.articleId },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.articleId !== dto.articleId) {
        throw new NotFoundException('Parent comment not found for this article');
      }
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          content: dto.content,
          articleId: dto.articleId,
          userId,
          parentId: dto.parentId,
          status: 'APPROVED',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.article.update({
        where: { id: dto.articleId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    return comment;
  }

  async update(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  async delete(userId: string, commentId: string, isAdmin = false) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.$transaction([
      this.prisma.comment.delete({
        where: { id: commentId },
      }),
      this.prisma.article.update({
        where: { id: comment.articleId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment deleted successfully' };
  }
}
