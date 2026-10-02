import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';

@Injectable()
export class SeriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(publishedOnly = true) {
    const series = await this.prisma.series.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            articles: publishedOnly ? { where: { status: 'PUBLISHED' } } : true,
          },
        },
      },
    });

    return series.map((s) => ({
      ...s,
      articleCount: s._count.articles,
    }));
  }


  async findBySlug(slug: string) {
    const series = await this.prisma.series.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { seriesOrder: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            readingTime: true,
            difficulty: true,
            seriesOrder: true,
            publishedAt: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException(`Series with slug '${slug}' not found`);
    }

    return {
      ...series,
      articleCount: series.articles.length,
    };
  }

  async findById(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { seriesOrder: 'asc' },
        },
      },
    });

    if (!series) {
      throw new NotFoundException(`Series with ID '${id}' not found`);
    }

    return series;
  }

  async create(dto: CreateSeriesDto) {
    const existing = await this.prisma.series.findFirst({
      where: {
        OR: [{ slug: dto.slug.toLowerCase() }, { title: dto.title }],
      },
    });

    if (existing) {
      throw new ConflictException('A series with this title or slug already exists');
    }

    return this.prisma.series.create({
      data: {
        title: dto.title,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
        coverImage: dto.coverImage,
        published: dto.published ?? false,
      },
    });
  }

  async update(id: string, dto: UpdateSeriesDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.series.findFirst({
        where: {
          slug: dto.slug.toLowerCase(),
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('A series with this slug already exists');
      }
    }

    return this.prisma.series.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    // Unlink articles associated with this series
    await this.prisma.article.updateMany({
      where: { seriesId: id },
      data: { seriesId: null, seriesOrder: null },
    });

    await this.prisma.series.delete({
      where: { id },
    });

    return { message: 'Series deleted successfully and articles unlinked' };
  }
}
