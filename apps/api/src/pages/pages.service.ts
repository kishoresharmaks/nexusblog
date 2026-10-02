import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(publishedOnly = true) {
    return this.prisma.page.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: { title: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (!page) {
      throw new NotFoundException(`Page with slug '${slug}' not found`);
    }

    return page;
  }

  async findById(id: string) {
    const page = await this.prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    return page;
  }

  async create(dto: CreatePageDto) {
    const existing = await this.prisma.page.findUnique({
      where: { slug: dto.slug.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`A page with slug '${dto.slug}' already exists`);
    }

    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug: dto.slug.toLowerCase(),
        content: dto.content,
        excerpt: dto.excerpt,
        published: dto.published !== undefined ? dto.published : true,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  async update(id: string, dto: UpdatePageDto) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    if (dto.slug && dto.slug.toLowerCase() !== page.slug) {
      const existing = await this.prisma.page.findUnique({
        where: { slug: dto.slug.toLowerCase() },
      });
      if (existing) {
        throw new ConflictException(`A page with slug '${dto.slug}' already exists`);
      }
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase() }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.published !== undefined && { published: dto.published }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
      },
    });
  }

  async delete(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Page with ID '${id}' not found`);
    }

    await this.prisma.page.delete({ where: { id } });
    return { success: true, message: `Page '${page.title}' deleted successfully` };
  }
}
