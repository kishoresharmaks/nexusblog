import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const technologies = await this.prisma.technology.findMany({
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

    return technologies.map((tech) => ({
      ...tech,
      articleCount: tech._count.articles,
    }));
  }

  async findBySlug(slug: string) {
    const tech = await this.prisma.technology.findUnique({
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

    if (!tech) {
      throw new NotFoundException(`Technology with slug '${slug}' not found`);
    }

    return {
      ...tech,
      articleCount: tech._count.articles,
    };
  }

  async findById(id: string) {
    const tech = await this.prisma.technology.findUnique({
      where: { id },
    });

    if (!tech) {
      throw new NotFoundException(`Technology with ID '${id}' not found`);
    }

    return tech;
  }

  async create(dto: CreateTechnologyDto) {
    const existing = await this.prisma.technology.findFirst({
      where: {
        OR: [{ slug: dto.slug.toLowerCase() }, { name: dto.name }],
      },
    });

    if (existing) {
      throw new ConflictException('A technology with this name or slug already exists');
    }

    return this.prisma.technology.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
        logo: dto.logo,
        officialUrl: dto.officialUrl,
        docsUrl: dto.docsUrl,
      },
    });
  }

  async update(id: string, dto: UpdateTechnologyDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.technology.findFirst({
        where: {
          slug: dto.slug.toLowerCase(),
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('A technology with this slug already exists');
      }
    }

    return this.prisma.technology.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
        ...(dto.officialUrl !== undefined && { officialUrl: dto.officialUrl }),
        ...(dto.docsUrl !== undefined && { docsUrl: dto.docsUrl }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.technology.delete({
      where: { id },
    });

    return { message: 'Technology deleted successfully' };
  }
}
