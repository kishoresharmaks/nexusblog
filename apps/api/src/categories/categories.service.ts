import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { order: 'asc' },
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

    return categories.map((cat) => ({
      ...cat,
      articleCount: cat._count.articles,
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
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

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return {
      ...category,
      articleCount: category._count.articles,
    };
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: {
        OR: [{ slug: dto.slug.toLowerCase() }, { name: dto.name }],
      },
    });

    if (existing) {
      throw new ConflictException('A category with this name or slug already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
        image: dto.image,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        order: dto.order ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: {
          slug: dto.slug.toLowerCase(),
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('A category with this slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.slug && { slug: dto.slug.toLowerCase() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.image !== undefined && { image: dto.image }),
        ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
        ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    // Check if category has articles
    const articleCount = await this.prisma.article.count({
      where: { categoryId: id },
    });

    if (articleCount > 0) {
      throw new ConflictException(
        `Cannot delete category. It is referenced by ${articleCount} article(s). Reassign them first.`,
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }
}
