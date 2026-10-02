import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleTypeDto } from './dto/create-article-type.dto';
import { UpdateArticleTypeDto } from './dto/update-article-type.dto';

const DEFAULT_ARTICLE_TYPES = [
  {
    name: 'System Design',
    slug: 'SYSTEM_DESIGN',
    description: 'Architectural analysis, scaling patterns, and distributed topologies',
    badgeColor: 'blue',
    order: 1,
  },
  {
    name: 'Deep Dive',
    slug: 'DEEP_DIVE',
    description: 'In-depth internal mechanics, kernel/engine details, and low-level breakdown',
    badgeColor: 'violet',
    order: 2,
  },
  {
    name: 'Tutorial',
    slug: 'TUTORIAL',
    description: 'Step-by-step implementation, coding workflows, and build guides',
    badgeColor: 'emerald',
    order: 3,
  },
  {
    name: 'Case Study',
    slug: 'CASE_STUDY',
    description: 'Real-world production post-mortems, architectural migrations, and scale journeys',
    badgeColor: 'amber',
    order: 4,
  },
  {
    name: 'Benchmark',
    slug: 'BENCHMARK',
    description: 'Performance benchmarks, latency profiles, throughput tests, and load analysis',
    badgeColor: 'rose',
    order: 5,
  },
  {
    name: 'Comparison',
    slug: 'COMPARISON',
    description: 'Direct side-by-side technology evaluations, trade-offs, and decision matrices',
    badgeColor: 'cyan',
    order: 6,
  },
  {
    name: 'Guide',
    slug: 'GUIDE',
    description: 'Production checklists, best practice guides, and operational standards',
    badgeColor: 'indigo',
    order: 7,
  },
  {
    name: 'How-To',
    slug: 'HOW_TO',
    description: 'Focused troubleshooting, quick fixes, and practical technical recipes',
    badgeColor: 'teal',
    order: 8,
  },
  {
    name: 'Reference',
    slug: 'REFERENCE',
    description: 'API contracts, cheatsheets, configuration blueprints, and standards',
    badgeColor: 'sky',
    order: 9,
  },
  {
    name: 'Opinion',
    slug: 'OPINION',
    description: 'Thought leadership, tech trends, and industry perspectives',
    badgeColor: 'purple',
    order: 10,
  },
];

@Injectable()
export class ArticleTypesService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.articleTypeModel.count();
      if (count === 0) {
        for (const item of DEFAULT_ARTICLE_TYPES) {
          await this.prisma.articleTypeModel.create({
            data: item,
          });
        }
      }
    } catch {
      // Ignored if DB is initializing
    }
  }

  async findAll(): Promise<any[]> {
    const types = await this.prisma.articleTypeModel.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    if (types.length === 0) {
      // Auto seed if empty
      for (const item of DEFAULT_ARTICLE_TYPES) {
        await this.prisma.articleTypeModel.create({
          data: item,
        });
      }
      return this.findAll();
    }

    // Attach article counts
    const articleCounts = await this.prisma.article.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { status: 'PUBLISHED' },
    });

    const countMap = new Map<string, number>();
    for (const c of articleCounts) {
      countMap.set(c.type.toUpperCase(), c._count.id);
    }

    return types.map((t) => ({
      ...t,
      articleCount: countMap.get(t.slug.toUpperCase()) || 0,
    }));
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.articleTypeModel.findUnique({
      where: { slug: slug.toUpperCase() },
    });

    if (!item) {
      throw new NotFoundException(`Article type with slug '${slug}' not found`);
    }

    const articleCount = await this.prisma.article.count({
      where: { type: item.slug, status: 'PUBLISHED' },
    });

    return {
      ...item,
      articleCount,
    };
  }

  async findById(id: string) {
    const item = await this.prisma.articleTypeModel.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Article type with ID '${id}' not found`);
    }

    return item;
  }

  async create(dto: CreateArticleTypeDto) {
    const normalizedSlug = dto.slug.toUpperCase().trim().replace(/[\s-]+/g, '_');
    const existing = await this.prisma.articleTypeModel.findFirst({
      where: {
        OR: [{ slug: normalizedSlug }, { name: dto.name.trim() }],
      },
    });

    if (existing) {
      throw new ConflictException('An article type with this name or slug already exists');
    }

    return this.prisma.articleTypeModel.create({
      data: {
        name: dto.name.trim(),
        slug: normalizedSlug,
        description: dto.description?.trim(),
        badgeColor: dto.badgeColor?.trim() || 'blue',
        order: dto.order ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateArticleTypeDto) {
    await this.findById(id);

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.description !== undefined) updateData.description = dto.description?.trim();
    if (dto.badgeColor !== undefined) updateData.badgeColor = dto.badgeColor?.trim();
    if (dto.order !== undefined) updateData.order = dto.order;

    if (dto.slug) {
      const normalizedSlug = dto.slug.toUpperCase().trim().replace(/[\s-]+/g, '_');
      const existing = await this.prisma.articleTypeModel.findFirst({
        where: {
          slug: normalizedSlug,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('An article type with this slug already exists');
      }
      updateData.slug = normalizedSlug;
    }

    return this.prisma.articleTypeModel.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const item = await this.findById(id);

    // Check if any articles are assigned to this type
    const articleCount = await this.prisma.article.count({
      where: { type: item.slug },
    });

    if (articleCount > 0) {
      throw new ConflictException(
        `Cannot delete article type "${item.name}" because ${articleCount} article(s) are assigned to it. Reassign those articles first.`
      );
    }

    return this.prisma.articleTypeModel.delete({
      where: { id },
    });
  }
}
