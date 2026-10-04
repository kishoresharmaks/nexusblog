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

  public sanitizeUrl(url?: string | null): string {
    if (!url || typeof url !== 'string') return '';
    return url
      .replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//, '/uploads/')
      .replace(/^https?:\/\/(www\.)?nexusblog\.dev\/uploads\//, '/uploads/');
  }

  public sanitizeArticle<T>(article: T): T {
    if (!article) return article;
    const clone: any = { ...(article as any) };
    if (clone.coverImage) {
      clone.coverImage = this.sanitizeUrl(clone.coverImage);
    }
    if (clone.thumbnail) {
      clone.thumbnail = this.sanitizeUrl(clone.thumbnail);
    }
    if (clone.ogImage) {
      clone.ogImage = this.sanitizeUrl(clone.ogImage);
    }
    if (clone.content) {
      clone.content = clone.content
        .replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/uploads\//g, '/uploads/')
        .replace(/https?:\/\/(www\.)?nexusblog\.dev\/uploads\//g, '/uploads/');
    }
    if (clone.author && clone.author.avatar) {
      clone.author = {
        ...clone.author,
        avatar: this.sanitizeUrl(clone.author.avatar),
      };
    }
    if (clone.category && clone.category.image) {
      clone.category = {
        ...clone.category,
        image: this.sanitizeUrl(clone.category.image),
      };
    }
    return clone as T;
  }

  async findAdminArticles(query: QueryArticleDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && (query.status as string) !== 'ALL') {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { category: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.categorySlug) {
      where.category = { slug: query.categorySlug.toLowerCase() };
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
          status: true,
          featured: true,
          readingTime: true,
          viewsCount: true,
          likesCount: true,
          bookmarksCount: true,
          commentsCount: true,
          publishedAt: true,
          createdAt: true,
          isGuestPost: true,
          guestAuthorName: true,
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
      items: items.map((item) => this.sanitizeArticle(item)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    };
  }

  async findAdminArticleById(idOrSlug: string) {
    let article = await this.prisma.article.findUnique({
      where: { id: idOrSlug },
      include: {
        category: true,
        tags: true,
        technologies: true,
        series: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    }).catch(() => null);

    if (!article) {
      article = await this.prisma.article.findUnique({
        where: { slug: idOrSlug.toLowerCase() },
        include: {
          category: true,
          tags: true,
          technologies: true,
          series: true,
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      }).catch(() => null);
    }

    if (!article) {
      throw new NotFoundException(`Article '${idOrSlug}' not found`);
    }

    return this.sanitizeArticle(article);
  }

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
          isGuestPost: true,
          guestAuthorName: true,
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
      items: items.map((item) => this.sanitizeArticle(item)),
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

    const rawRelated = await this.findRelatedArticles(
      article.id,
      article.categoryId,
      article.tagIds,
    );
    const relatedArticles = rawRelated.map((item) => this.sanitizeArticle(item));

    return this.sanitizeArticle({
      ...article,
      isBookmarked,
      relatedArticles,
    });
  }

  async findRelatedArticles(currentArticleId: string, categoryId: string, tagIds: string[]) {
    const items = await this.prisma.article.findMany({
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
            image: true,
          },
        },
      },
    });

    return items.map((item) => this.sanitizeArticle(item));
  }

  async create(dto: CreateArticleDto, authorId: string) {
    const existing = await this.prisma.article.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An article with this slug already exists');
    }

    let categoryId = dto.categoryId;
    if (!categoryId && (dto as any).categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: (dto as any).categorySlug.toLowerCase() },
      }).catch(() => null);
      if (cat) categoryId = cat.id;
    }
    if (!categoryId) {
      const firstCat = await this.prisma.category.findFirst();
      categoryId = firstCat?.id || '';
    }

    const publishedAt =
      dto.status === ArticleStatus.PUBLISHED ? new Date() : undefined;

    const excerpt = dto.excerpt || (dto.content ? dto.content.replace(/^[#\s\n*`_-]+/, '').slice(0, 160).trim() : 'Technical article.');

    const created = await this.prisma.article.create({
      data: {
        title: dto.title,
        slug: dto.slug.toLowerCase(),
        excerpt,
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
        categoryId,
        tagIds: dto.tagIds || [],
        technologyIds: dto.technologyIds || [],
        seriesId: dto.seriesId && dto.seriesId.trim().length === 24 ? dto.seriesId : null,
        seriesOrder: dto.seriesId ? (dto.seriesOrder || 1) : null,
        prerequisites: dto.prerequisites || [],
        keyTakeaways: dto.keyTakeaways || [],
        references: dto.references || [],
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        canonicalUrl: dto.canonicalUrl,
        publishedAt,
      },
    });

    return this.sanitizeArticle(created);
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

    let categoryId = dto.categoryId;
    if (!categoryId && (dto as any).categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: (dto as any).categorySlug.toLowerCase() },
      }).catch(() => null);
      if (cat) categoryId = cat.id;
    }

    let publishedAt = article.publishedAt;
    if (dto.status === ArticleStatus.PUBLISHED && !article.publishedAt) {
      publishedAt = new Date();
    } else if (dto.status === ArticleStatus.DRAFT) {
      publishedAt = null as any;
    }

    const updated = await this.prisma.article.update({
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
        ...(isStaff && dto.authorId && { authorId: dto.authorId }),
        ...(categoryId && { categoryId }),
        ...(dto.tagIds !== undefined && { tagIds: dto.tagIds }),
        ...(dto.technologyIds !== undefined && { technologyIds: dto.technologyIds }),
        ...(dto.seriesId !== undefined && {
          seriesId: dto.seriesId && dto.seriesId.trim().length === 24 ? dto.seriesId : null,
          seriesOrder: dto.seriesId ? (dto.seriesOrder || 1) : null,
        }),
        ...(dto.seriesOrder !== undefined && dto.seriesId === undefined && {
          seriesOrder: dto.seriesOrder,
        }),
        ...(dto.prerequisites !== undefined && { prerequisites: dto.prerequisites }),
        ...(dto.keyTakeaways !== undefined && { keyTakeaways: dto.keyTakeaways }),
        ...(dto.references !== undefined && { references: dto.references }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
        ...(dto.canonicalUrl !== undefined && { canonicalUrl: dto.canonicalUrl }),
        publishedAt,
      },
    });

    return this.sanitizeArticle(updated);
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

  async toggleLike(articleId: string, action?: 'like' | 'unlike') {
    const existing = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, likesCount: true },
    });

    if (!existing) {
      throw new NotFoundException(`Article with ID '${articleId}' not found`);
    }

    const currentLikes = typeof existing.likesCount === 'number' ? existing.likesCount : 0;
    let nextLikes = currentLikes;

    if (action === 'unlike') {
      nextLikes = Math.max(0, currentLikes - 1);
    } else {
      nextLikes = currentLikes + 1;
    }

    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: { likesCount: nextLikes },
      select: { likesCount: true },
    });

    return { likesCount: article.likesCount };
  }
}
