import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

export interface ProcessedVariant {
  name: 'original' | 'thumbnail' | 'small' | 'medium' | 'large' | 'og';
  width: number;
  height: number;
  format: 'avif' | 'webp' | 'png' | 'jpeg';
  size: number;
  buffer: Buffer;
  storageKeySuffix: string;
}

export interface ImageProcessingResult {
  width: number;
  height: number;
  format: string;
  size: number;
  blurHash?: string;
  variants: ProcessedVariant[];
}

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  async processImage(buffer: Buffer, originalExt: string): Promise<ImageProcessingResult> {
    const isSvg = originalExt.toLowerCase() === '.svg';

    if (isSvg) {
      return {
        width: 800,
        height: 600,
        format: 'svg',
        size: buffer.length,
        variants: [
          {
            name: 'original',
            width: 800,
            height: 600,
            format: 'png',
            size: buffer.length,
            buffer,
            storageKeySuffix: 'original.svg',
          },
        ],
      };
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const originalWidth = metadata.width || 1200;
    const originalHeight = metadata.height || 800;

    // Generate low-res placeholder (base64 data URI as blur placeholder)
    let blurHash: string | undefined = undefined;
    try {
      const tinyBuffer = await image
        .clone()
        .resize(32, 20, { fit: 'inside' })
        .webp({ quality: 20 })
        .toBuffer();
      blurHash = `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
    } catch (e) {
      this.logger.warn(`Failed to generate blur preview: ${(e as Error).message}`);
    }

    const variantsToGenerate = [
      { name: 'thumbnail' as const, width: 320, suffix: 'thumbnail.webp' },
      { name: 'small' as const, width: 640, suffix: 'small.webp' },
      { name: 'medium' as const, width: 960, suffix: 'medium.webp' },
      { name: 'large' as const, width: 1280, suffix: 'large.webp' },
    ];

    const processedVariants: ProcessedVariant[] = [];

    // Add original WebP conversion
    const originalWebpBuffer = await image.clone().webp({ quality: 85 }).toBuffer();
    processedVariants.push({
      name: 'original',
      width: originalWidth,
      height: originalHeight,
      format: 'webp',
      size: originalWebpBuffer.length,
      buffer: originalWebpBuffer,
      storageKeySuffix: 'original.webp',
    });

    // Generate smaller variants only if original is larger
    for (const v of variantsToGenerate) {
      if (originalWidth >= v.width) {
        try {
          const variantBuffer = await image
            .clone()
            .resize({ width: v.width, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

          const vMeta = await sharp(variantBuffer).metadata();

          processedVariants.push({
            name: v.name,
            width: vMeta.width || v.width,
            height: vMeta.height || Math.round((originalHeight * v.width) / originalWidth),
            format: 'webp',
            size: variantBuffer.length,
            buffer: variantBuffer,
            storageKeySuffix: v.suffix,
          });
        } catch (err) {
          this.logger.warn(`Failed to generate ${v.name} variant: ${(err as Error).message}`);
        }
      }
    }

    return {
      width: originalWidth,
      height: originalHeight,
      format: metadata.format || 'webp',
      size: buffer.length,
      blurHash,
      variants: processedVariants,
    };
  }
}
