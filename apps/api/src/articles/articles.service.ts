import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemSettingsService } from '../system-settings/system-settings.service';
import { IndexNowService } from '../indexnow/indexnow.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticleDto } from './dto/query-article.dto';
import { ArticleStatus, Role } from '@prisma/client';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemSettingsService: SystemSettingsService,
    private readonly indexNowService: IndexNowService,
  ) {}

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

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { excerpt: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { category: { name: { contains: term, mode: 'insensitive' } } },
        { technologies: { some: { name: { contains: term, mode: 'insensitive' } } } },
        { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
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

    const filter = (query.filter as string)?.toLowerCase();
    if (filter === 'featured') {
      where.featured = true;
    }

    let orderBy: any = { publishedAt: 'desc' };
    if (filter === 'popular') {
      orderBy = { viewsCount: 'desc' };
    } else if (filter === 'bookmarked' || filter === 'bookmarks') {
      orderBy = { bookmarksCount: 'desc' };
    } else if (filter === 'liked' || filter === 'likes') {
      orderBy = { likesCount: 'desc' };
    } else if (filter === 'quick_read') {
      orderBy = { readingTime: 'asc' };
    } else if (filter === 'deep_dive') {
      orderBy = { readingTime: 'desc' };
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

    if (created.status === ArticleStatus.PUBLISHED) {
      this.indexNowService.submitArticleUrl(created.slug);
    }

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

    if (updated.status === ArticleStatus.PUBLISHED) {
      this.indexNowService.submitArticleUrl(updated.slug);
    }

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

  /**
   * Summarize article content using Gemini AI or Smart Extractive Engine based on Admin Dev Config
   */
  async summarizeArticle(dto: { slug?: string; title?: string; excerpt?: string; content?: string }) {
    const settingsMap = await this.systemSettingsService.getAllSettings();

    const enabledVal = settingsMap.aiSummaryEnabled?.value ?? process.env.AI_SUMMARY_ENABLED ?? 'true';
    const isEnabled = enabledVal === 'true';

    if (!isEnabled) {
      throw new ForbiddenException('AI Content Summarizer feature is disabled by administrator in Dev Config.');
    }

    let title = dto.title || '';
    let excerpt = dto.excerpt || '';
    let content = dto.content || '';

    if (dto.slug && (!title || !content)) {
      const article = await this.prisma.article.findUnique({
        where: { slug: dto.slug },
        select: { title: true, excerpt: true, content: true },
      });
      if (article) {
        title = title || article.title;
        excerpt = excerpt || article.excerpt;
        content = content || article.content;
      }
    }

    if (!title && !content) {
      throw new NotFoundException('Article content or title is required for summarization.');
    }

    const provider = settingsMap.aiSummaryProvider?.value || process.env.AI_SUMMARY_PROVIDER || 'hybrid';
    let apiKey = settingsMap.aiSummaryApiKey?.value || '';
    if (!apiKey || apiKey.includes('...')) {
      apiKey = process.env.GEMINI_API_KEY || process.env.AI_SUMMARY_API_KEY || '';
    }
    const model = settingsMap.aiSummaryModel?.value || process.env.AI_SUMMARY_MODEL || 'gemini-1.5-flash';
    const maxBullets = parseInt(settingsMap.aiSummaryMaxBullets?.value || '3', 10) || 3;

    const generateSmartFallback = () => {
      const bullets: string[] = [];
      const cleanText = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/#+\s+/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '');

      const headingMatches = content.match(/^##\s+(.+)$/gm);
      if (headingMatches && headingMatches.length >= 2) {
        headingMatches.slice(0, maxBullets).forEach((h) => {
          const cleanH = h.replace(/^##\s+/, '').trim();
          if (cleanH.length > 5) {
            bullets.push(`Key Topic: ${cleanH}`);
          }
        });
      }

      if (bullets.length < maxBullets && excerpt) {
        const sentences = excerpt.split('.').filter((s) => s.trim().length > 15);
        sentences.forEach((s) => {
          if (bullets.length < maxBullets) {
            bullets.push(s.trim());
          }
        });
      }

      if (bullets.length < maxBullets) {
        const bodySentences = cleanText.split(/\. |\n+/).filter((s) => s.trim().length > 25 && s.trim().length < 180);
        bodySentences.slice(0, maxBullets - bullets.length).forEach((s) => {
          bullets.push(s.trim().replace(/^[-*•]\s*/, ''));
        });
      }

      while (bullets.length < Math.min(maxBullets, 3)) {
        if (bullets.length === 0) bullets.push(`High-performance technical blueprint for ${title}.`);
        else if (bullets.length === 1) bullets.push('Covers production readiness, architecture trade-offs, and design patterns.');
        else bullets.push('Includes benchmark performance metrics and reproducible source code.');
      }

      return bullets.slice(0, maxBullets);
    };

    if ((provider === 'hybrid' || provider === 'gemini') && apiKey && apiKey.length > 5) {
      try {
        const promptText = `You are a principal software architect. Summarize the following engineering article into exactly ${maxBullets} concise, high-impact bullet points. Return ONLY a raw JSON array of strings, for example: ["Bullet 1", "Bullet 2", "Bullet 3"]. Do not wrap in markdown or backticks.\n\nTitle: ${title}\nExcerpt: ${excerpt}\nContent:\n${content.substring(0, 4000)}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 500,
              },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanJson = rawText.replace(/```json|```/gi, '').trim();

          const parsed = JSON.parse(cleanJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return {
              success: true,
              bullets: parsed.slice(0, maxBullets),
              source: 'gemini',
              modelUsed: model,
            };
          }
        }
      } catch (err) {
        this.logger.warn(`Gemini AI summarization failed, reverting to smart fallback: ${err}`);
      }
    }

    if (provider === 'gemini' && (!apiKey || apiKey.length <= 5)) {
      this.logger.warn('Gemini API key is not configured in Admin Dev Config. Falling back to smart summary extractor.');
    }

    return {
      success: true,
      bullets: generateSmartFallback(),
      source: 'smart_fallback',
      modelUsed: 'smart_extractor',
    };
  }
}
