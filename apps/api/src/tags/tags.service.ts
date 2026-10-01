import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      articleCount: tag._count.articles,
    }));
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug '${slug}' not found`);
    }

    return {
      ...tag,
      articleCount: tag._count.articles,
    };
  }

  async findById(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID '${id}' not found`);
    }

    return tag;
  }

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: {
        OR: [{ slug: dto.slug.toLowerCase() }, { name: dto.name }],
      },
    });

    if (existing) {
      throw new ConflictException('A tag with this name or slug already exists');
    }

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          slug: dto.slug.toLowerCase(),
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('A tag with this slug already exists');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'Tag deleted successfully' };
  }
}
