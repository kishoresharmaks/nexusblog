import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestPostDto } from './dto/create-guest-post.dto';
import { UpdateGuestPostDto } from './dto/update-guest-post.dto';
import { GuestPostStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class GuestPostsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private cleanExcerpt(content: string, fallbackTitle: string): string {
    const plain = content
      .replace(/<[^>]+>/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*`_~\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (plain.length > 0) {
      return plain.slice(0, 160) + (plain.length > 160 ? '...' : '');
    }
    return `An in-depth technical guide on ${fallbackTitle}.`;
  }

  private async resolveCategoryId(categoryIdOrSlug?: string): Promise<string> {
    if (categoryIdOrSlug && categoryIdOrSlug.length === 24) {
      const exists = await this.prisma.category.findUnique({ where: { id: categoryIdOrSlug } });
      if (exists) return exists.id;
    }

    if (categoryIdOrSlug) {
      const bySlug = await this.prisma.category.findUnique({ where: { slug: categoryIdOrSlug } });
      if (bySlug) return bySlug.id;
    }

    const defaultCat =
      (await this.prisma.category.findFirst({ where: { slug: 'system-design' } })) ||
      (await this.prisma.category.findFirst());

    if (!defaultCat) {
      throw new BadRequestException('No categories available in the database');
    }

    return defaultCat.id;
  }

  async getUserSubmissions(authorId: string, status?: GuestPostStatus) {
    return this.prisma.guestPost.findMany({
      where: {
        authorId,
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });
  }

  async getSubmissionById(userId?: string | null, id?: string, token?: string, isAdmin = false) {
    if (!id) {
      throw new BadRequestException('Submission ID is required');
    }

    const post = await this.prisma.guestPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Guest post submission not found');
    }

    if (isAdmin) {
      return post;
    }

    // Check if matching authenticated user
    if (userId && post.authorId && post.authorId === userId) {
      return post;
    }

    // Check if matching anonymous editToken
    if (token && post.editToken && post.editToken === token) {
      return post;
    }

    throw new ForbiddenException('You do not have permission to view this submission. Valid login or secret edit token required.');
  }

  async create(authorId: string | null | undefined, dto: CreateGuestPostDto) {
    const slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.title);
    
    // Ensure slug uniqueness
    let counter = 1;
    let finalSlug = slug;
    while (await this.prisma.guestPost.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const categoryId = await this.resolveCategoryId(dto.categoryId);
    const excerpt = dto.excerpt?.trim() ? dto.excerpt.trim() : this.cleanExcerpt(dto.content, dto.title);

    const status: GuestPostStatus = dto.submitForReview
      ? GuestPostStatus.SUBMITTED
      : GuestPostStatus.DRAFT;

    // Generate editToken for anonymous users (or always provide a fallback token)
    const editToken = crypto.randomBytes(24).toString('hex');

    return this.prisma.guestPost.create({
      data: {
        title: dto.title,
        slug: finalSlug,
        excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        status,
        difficulty: dto.difficulty ?? 'INTERMEDIATE',
        type: dto.type ?? 'TUTORIAL',
        authorId: authorId || null,
        guestName: dto.guestName || null,
        guestEmail: dto.guestEmail || null,
        editToken: !authorId ? editToken : null,
        authorBio: dto.authorBio,
        authorAvatar: dto.authorAvatar,
        socialLinks: dto.socialLinks ?? {},
        categoryId,
        tagIds: dto.tagIds ?? [],
        technologyIds: dto.technologyIds ?? [],
        references: dto.references ?? [],
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        submittedAt: dto.submitForReview ? new Date() : null,
      },
      include: {
        category: true,
      },
    });
  }

  async update(
    userId: string | null | undefined,
    id: string,
    dto: UpdateGuestPostDto,
    token?: string,
    isAdmin = false,
  ) {
    const effectiveToken = token || dto.editToken;
    const existing = await this.getSubmissionById(userId, id, effectiveToken, isAdmin);

    if (!isAdmin && (existing.status === GuestPostStatus.APPROVED || existing.status === GuestPostStatus.PUBLISHED)) {
      throw new BadRequestException('Approved or published articles cannot be modified directly');
    }

    let nextStatus = existing.status;
    let submittedAt = existing.submittedAt;

    if (
      dto.resubmit ||
      (dto.submitForReview &&
        (existing.status === GuestPostStatus.DRAFT ||
          existing.status === GuestPostStatus.CHANGES_REQUESTED))
    ) {
      nextStatus = GuestPostStatus.SUBMITTED;
      submittedAt = new Date();
    }

    let categoryId = existing.categoryId;
    if (dto.categoryId) {
      categoryId = await this.resolveCategoryId(dto.categoryId);
    }

    const excerpt = dto.excerpt?.trim()
      ? dto.excerpt.trim()
      : dto.content
      ? this.cleanExcerpt(dto.content, dto.title || existing.title)
      : existing.excerpt;

    return this.prisma.guestPost.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.content && { content: dto.content }),
        excerpt,
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        categoryId,
        ...(dto.guestName !== undefined && { guestName: dto.guestName }),
        ...(dto.guestEmail !== undefined && { guestEmail: dto.guestEmail }),
        ...(dto.tagIds && { tagIds: dto.tagIds }),
        ...(dto.technologyIds && { technologyIds: dto.technologyIds }),
        ...(dto.difficulty && { difficulty: dto.difficulty }),
        ...(dto.type && { type: dto.type }),
        ...(dto.authorBio !== undefined && { authorBio: dto.authorBio }),
        ...(dto.authorAvatar !== undefined && { authorAvatar: dto.authorAvatar }),
        ...(dto.socialLinks !== undefined && { socialLinks: dto.socialLinks }),
        ...(dto.references && { references: dto.references }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
        status: nextStatus,
        submittedAt,
      },
      include: {
        category: true,
      },
    });
  }

  async delete(userId: string | null | undefined, id: string, token?: string, isAdmin = false) {
    const existing = await this.getSubmissionById(userId, id, token, isAdmin);

    if (!isAdmin && (existing.status === GuestPostStatus.APPROVED || existing.status === GuestPostStatus.PUBLISHED)) {
      throw new BadRequestException('Cannot delete an approved or published article');
    }

    await this.prisma.guestPost.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }

  async findAllForModeration(status?: GuestPostStatus) {
    return this.prisma.guestPost.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async moderateSubmission(
    id: string,
    action: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT',
    feedback?: string,
    reviewerId?: string,
  ) {
    const post = await this.prisma.guestPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Guest post not found');
    }

    let status: GuestPostStatus;
    if (action === 'APPROVE') status = GuestPostStatus.PUBLISHED;
    else if (action === 'REQUEST_CHANGES') status = GuestPostStatus.CHANGES_REQUESTED;
    else status = GuestPostStatus.REJECTED;

    const updated = await this.prisma.guestPost.update({
      where: { id },
      data: {
        status,
        editorialFeedback: feedback,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
      include: {
        category: true,
        author: true,
      },
    });

    // If approved, create a published article from the guest post
    if (action === 'APPROVE') {
      // Check if slug is already used in articles table, ensure unique
      let articleSlug = post.slug;
      let counter = 1;
      while (await this.prisma.article.findUnique({ where: { slug: articleSlug } })) {
        articleSlug = `${post.slug}-${counter++}`;
      }

      // Determine authorId: if registered author exists, use post.authorId.
      // Otherwise fallback to reviewerId or first admin in database.
      let effectiveAuthorId = post.authorId;
      if (!effectiveAuthorId) {
        if (reviewerId) {
          effectiveAuthorId = reviewerId;
        } else {
          const adminUser =
            (await this.prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })) ||
            (await this.prisma.user.findFirst({ where: { role: 'ADMIN' } })) ||
            (await this.prisma.user.findFirst());
          effectiveAuthorId = adminUser?.id || null;
        }
      }

      const guestAuthorName =
        updated.guestName || updated.author?.name || 'Guest Contributor';

      const article = await this.prisma.article.create({
        data: {
          title: post.title,
          slug: articleSlug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          status: 'PUBLISHED',
          difficulty: post.difficulty,
          type: post.type,
          authorId: effectiveAuthorId,
          categoryId: post.categoryId,
          tagIds: post.tagIds,
          technologyIds: post.technologyIds,
          references: post.references,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          publishedAt: new Date(),
          isGuestPost: true,
          guestAuthorName: guestAuthorName,
        } as any,
      });

      await this.prisma.guestPost.update({
        where: { id },
        data: { publishedArticleId: article.id },
      });
    }

    return updated;
  }
}
