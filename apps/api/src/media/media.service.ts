import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IStorageProvider, STORAGE_PROVIDER } from './providers/storage-provider.interface';
import { ImageProcessorService } from './image-processor.service';
import { CreatePresignedUrlDto, ConfirmUploadDto } from './dto/create-presigned-url.dto';
import { UpdateMediaDto, QueryMediaDto } from './dto/update-media.dto';
import * as crypto from 'crypto';
import * as path from 'path';
import { StorageProviderType } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private readonly storageProvider: IStorageProvider,
    private readonly imageProcessor: ImageProcessorService,
  ) {}

  private generateStoragePath(filename: string): { basePath: string; uuid: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomBytes(8).toString('hex');
    const basePath = `media/${year}/${month}/${uuid}`;
    return { basePath, uuid };
  }

  async uploadFile(
    file: Express.Multer.File,
    userId?: string | null,
    alt?: string,
    caption?: string,
  ) {
    const ext = path.extname(file.originalname);
    const { basePath } = this.generateStoragePath(file.originalname);

    // Process image into variants & placeholder
    const processed = await this.imageProcessor.processImage(file.buffer, ext);

    const uploadedVariants = [];
    let mainStorageKey = '';
    let mainUrl = '';

    for (const variant of processed.variants) {
      const variantKey = `${basePath}/${variant.storageKeySuffix}`;
      const uploadResult = await this.storageProvider.upload(
        variant.buffer,
        variantKey,
        `image/${variant.format}`,
      );

      uploadedVariants.push({
        name: variant.name,
        width: variant.width,
        height: variant.height,
        format: variant.format,
        size: variant.size,
        storageKey: variantKey,
        url: uploadResult.url,
      });

      if (variant.name === 'original') {
        mainStorageKey = variantKey;
        mainUrl = uploadResult.url;
      }
    }

    if (!mainUrl && uploadedVariants.length > 0) {
      mainStorageKey = uploadedVariants[0].storageKey;
      mainUrl = uploadedVariants[0].url;
    }

    const providerType: StorageProviderType =
      (process.env.STORAGE_PROVIDER as StorageProviderType) || 'local';

    const media = await this.prisma.media.create({
      data: {
        storageKey: mainStorageKey,
        provider: providerType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: processed.width,
        height: processed.height,
        alt: alt || file.originalname,
        caption,
        blurHash: processed.blurHash,
        variants: uploadedVariants,
        url: mainUrl,
        createdBy: userId ? (userId as any) : null,
      },
    });

    return media;
  }

  async createPresignedUploadUrl(dto: CreatePresignedUrlDto, _userId?: string) {
    if (!this.storageProvider.getPresignedUploadUrl) {
      throw new ConflictException(
        'Direct presigned uploads are only supported on cloud object storage (R2/S3). Use standard multipart upload for local storage.',
      );
    }

    const ext = path.extname(dto.filename);
    const { basePath } = this.generateStoragePath(dto.filename);
    const storageKey = `${basePath}/original${ext}`;

    const presigned = await this.storageProvider.getPresignedUploadUrl(
      storageKey,
      dto.mimeType,
    );

    return presigned;
  }

  async confirmPresignedUpload(dto: ConfirmUploadDto, userId?: string | null) {
    const providerType: StorageProviderType =
      (process.env.STORAGE_PROVIDER as StorageProviderType) || 'r2';

    const url = this.storageProvider.getUrl(dto.storageKey);

    const media = await this.prisma.media.create({
      data: {
        storageKey: dto.storageKey,
        provider: providerType,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        alt: dto.alt,
        caption: dto.caption,
        variants: [
          {
            name: 'original',
            width: 1200,
            height: 800,
            format: dto.mimeType.replace('image/', ''),
            size: dto.size,
            storageKey: dto.storageKey,
            url,
          },
        ],
        url,
        createdBy: userId ? (userId as any) : null,
      },
    });

    return media;
  }

  async findAll(query: QueryMediaDto, ownerId?: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ownerId) {
      where.createdBy = ownerId;
    }

    if (query.search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { originalName: { contains: query.search, mode: 'insensitive' } },
            { alt: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException(`Media with ID '${id}' not found`);
    }

    return media;
  }

  async update(id: string, dto: UpdateMediaDto) {
    await this.findById(id);

    return this.prisma.media.update({
      where: { id },
      data: {
        ...(dto.alt !== undefined && { alt: dto.alt }),
        ...(dto.caption !== undefined && { caption: dto.caption }),
      },
    });
  }

  async delete(id: string) {
    const media = await this.findById(id);

    // Deletion Safety Guard: Check if any article references this image URL or storage key
    const referencingArticles = await this.prisma.article.count({
      where: {
        OR: [
          { coverImage: { contains: media.storageKey } },
          { thumbnail: { contains: media.storageKey } },
          { content: { contains: media.url } },
        ],
      },
    });

    if (referencingArticles > 0) {
      throw new ConflictException(
        `Cannot delete media: It is currently referenced in ${referencingArticles} article(s). Please remove references from articles before deleting.`,
      );
    }

    // Delete variants from storage
    if (Array.isArray(media.variants)) {
      for (const variant of media.variants as any[]) {
        if (variant.storageKey) {
          try {
            await this.storageProvider.delete(variant.storageKey);
          } catch (e) {
            this.logger.warn(`Failed to delete storage file ${variant.storageKey}: ${(e as Error).message}`);
          }
        }
      }
    } else if (media.storageKey) {
      await this.storageProvider.delete(media.storageKey);
    }

    await this.prisma.media.delete({
      where: { id },
    });

    return { message: 'Media and all variants deleted successfully' };
  }
}
