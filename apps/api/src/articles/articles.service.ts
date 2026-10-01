import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleStatus, Role } from '@prisma/client';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findPublicFeed(query: QueryArticleDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      status: ArticleStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug.toLowerCase() };
    }

    if (query.tagSlug) {
      where.tags = { some: { slug: query.tagSlug.toLowerCase() } };
    }

    if (query.technologySlug) {
      where.technologies = { some: { slug: query.technologySlug.toLowerCase() } };
    }

    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.filter === 'featured') {
      where.featured = true;
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (query.filter === 'popular') {
      orderBy = { viewsCount: 'desc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          thumbnail: true,
          difficulty: true,
          type: true,
          featured: true,
          readingTime: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          commentsCount: true,
          publishedAt: true,
          createdAt: true,
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
          tags: {
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
              logo: true,
            },
          },
        },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async findPublicBySlug(slug: string, userId?: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            website: true,
            github: true,
            linkedin: true,
          },
        },
        category: true,
        tags: true,
        technologies: true,
        series: {
          include: {
            articles: {
              where: { status: ArticleStatus.PUBLISHED },
              orderBy: { seriesOrder: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                seriesOrder: true,
                readingTime: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug '${slug}' not found`);
    }

    if (article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException(`Article is currently not published`);
    }

    // Increment view count asynchronously
    this.prisma.article
      .update({
        where: { id: article.id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch((err) => this.logger.warn(`Failed to increment views: ${err.message}`));

    // Check user engagement state if logged in
    let isBookmarked = false;
    if (userId) {
      const bookmark = await this.prisma.bookmark.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId: article.id,
          },
        },
      });
      isBookmarked = !!bookmark;
    }

    const relatedArticles = await this.findRelatedArticles(
      article.id,
      article.categoryId,
      article.tagIds,
    );

    return {
      ...article,
      isBookmarked,
      relatedArticles,
    };
  }

  async findRelatedArticles(currentArticleId: string, categoryId: string, tagIds: string[]) {
    return this.prisma.article.findMany({
      where: {
        id: { not: currentArticleId },
        status: ArticleStatus.PUBLISHED,
        OR: [
          { categoryId },
          { tagIds: { hasSome: tagIds } },
        ],
      },
      take: 3,
      orderBy: { viewsCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        difficulty: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async create(dto: CreateArticleDto, authorId: string) {
    const existing = await this.prisma.article.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An article with this slug already exists');
    }

    const publishedAt =
      dto.status === ArticleStatus.PUBLISHED ? new Date() : undefined;

    return this.prisma.article.create({
      data: {
        title: dto.title,
        slug: dto.slug.toLowerCase(),
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        thumbnail: dto.thumbnail,
        ogImage: dto.ogImage,
        status: dto.status || ArticleStatus.DRAFT,
        difficulty: dto.difficulty || 'INTERMEDIATE',
        type: dto.type || 'SYSTEM_DESIGN',
        featured: dto.featured || false,
        readingTime: dto.readingTime || 5,
        authorId,
        categoryId: dto.categoryId,
        tagIds: dto.tagIds || [],
        technologyIds: dto.technologyIds || [],
        seriesId: dto.seriesId,
        seriesOrder: dto.seriesOrder,
        prerequisites: dto.prerequisites || [],
        keyTakeaways: dto.keyTakeaways || [],
        references: dto.references || [],
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        publishedAt,
      },
    });
  }

  async update(id: string, dto: UpdateArticleDto, user: { id: string; role: Role }) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    // Permission check: Author can only update own article; Editor/Admin can update any
    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role);
    if (!isStaff && article.authorId !== user.id) {
      throw new ForbiddenException('You do not have permission to edit this article');
    }

    if (dto.slug) {
      const existing = await this.prisma.article.findFirst({
        where: {
          slug: dto.slug.toLowerCase(),
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('An article with this slug already exists');
      }
    }

    let publishedAt = article.publishedAt;
    if (dto.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      publishedAt = new Date();
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
        ...(dto.ogImage !== undefined && { ogImage: dto.ogImage }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.readingTime !== undefined && { readingTime: dto.readingTime }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.tagIds !== undefined && { tagIds: dto.tagIds }),
        ...(dto.technologyIds !== undefined && { technologyIds: dto.technologyIds }),
        ...(dto.seriesId !== undefined && { seriesId: dto.seriesId }),
        ...(dto.seriesOrder !== undefined && { seriesOrder: dto.seriesOrder }),
        ...(dto.prerequisites !== undefined && { prerequisites: dto.prerequisites }),
        ...(dto.keyTakeaways !== undefined && { keyTakeaways: dto.keyTakeaways }),
        ...(dto.references !== undefined && { references: dto.references }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
        ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
        publishedAt,
      },
    });
  }

  async delete(id: string, user: { id: string; role: Role }) {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID '${id}' not found`);
    }

    const isStaff = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role);
    if (!isStaff && article.authorId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this article');
    }

    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  async toggleBookmark(articleId: string, userId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: { id: existing.id },
      });
      await this.prisma.article.update({
        where: { id: articleId },
        data: { bookmarksCount: { decrement: 1 } },
      });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: {
        userId,
        articleId,
      },
    });
    await this.prisma.article.update({
      where: { id: articleId },
      data: { bookmarksCount: { increment: 1 } },
    });

    return { bookmarked: true };
  }

  async toggleLike(articleId: string) {
    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });

    return { likesCount: article.likesCount };
  }
}
