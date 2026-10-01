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
          },
        },
      },
    });
  }

  async getSubmissionById(authorId: string, id: string, isAdmin = false) {
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

    if (post.authorId !== authorId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to view this submission');
    }

    return post;
  }

  async create(authorId: string, dto: CreateGuestPostDto) {
    let slug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.title);
    
    // Ensure slug uniqueness
    let counter = 1;
    let finalSlug = slug;
    while (await this.prisma.guestPost.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const status: GuestPostStatus = dto.submitForReview
      ? GuestPostStatus.SUBMITTED
      : GuestPostStatus.DRAFT;

    return this.prisma.guestPost.create({
      data: {
        title: dto.title,
        slug: finalSlug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        status,
        difficulty: dto.difficulty ?? 'INTERMEDIATE',
        type: dto.type ?? 'TUTORIAL',
        authorId,
        authorBio: dto.authorBio,
        authorAvatar: dto.authorAvatar,
        socialLinks: dto.socialLinks ?? {},
        categoryId: dto.categoryId,
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

  async update(authorId: string, id: string, dto: UpdateGuestPostDto, isAdmin = false) {
    const existing = await this.getSubmissionById(authorId, id, isAdmin);

    if (!isAdmin && existing.status === GuestPostStatus.APPROVED) {
      throw new BadRequestException('Approved guest posts cannot be modified directly');
    }

    let nextStatus = existing.status;
    let submittedAt = existing.submittedAt;

    if (dto.resubmit || (dto.submitForReview && existing.status === GuestPostStatus.DRAFT)) {
      nextStatus = GuestPostStatus.SUBMITTED;
      submittedAt = new Date();
    }

    return this.prisma.guestPost.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.excerpt && { excerpt: dto.excerpt }),
        ...(dto.content && { content: dto.content }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
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

  async delete(authorId: string, id: string, isAdmin = false) {
    const existing = await this.getSubmissionById(authorId, id, isAdmin);

    if (!isAdmin && existing.status === GuestPostStatus.APPROVED) {
      throw new BadRequestException('Cannot delete an approved article');
    }

    await this.prisma.guestPost.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }
}
