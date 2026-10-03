import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageProvider, UploadResult } from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly storageDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Relative to the process working directory or project root
    this.storageDir = path.resolve(
      process.cwd(),
      this.configService.get<string>('STORAGE_LOCAL_DIR') || '../../storage/local/media',
    );
    const rawApiUrl = (this.configService.get<string>('API_PUBLIC_URL') || '').trim();
    if (rawApiUrl && !rawApiUrl.includes('localhost') && !rawApiUrl.includes('127.0.0.1')) {
      this.baseUrl = rawApiUrl.endsWith('/uploads')
        ? rawApiUrl.replace(/\/+$/, '')
        : `${rawApiUrl.replace(/\/+$/, '')}/uploads`;
    } else {
      this.baseUrl = '/uploads';
    }

    this.initDirectory();
  }

  private async initDirectory() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (e) {
      this.logger.error(`Failed to initialize storage directory: ${this.storageDir}`, (e as Error).stack);
    }
  }

  async upload(buffer: Buffer, key: string, _mimeType: string): Promise<UploadResult> {
    const filePath = path.join(this.storageDir, key);
    const parentDir = path.dirname(filePath);

    await fs.mkdir(parentDir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const url = this.getUrl(key);
    return {
      key,
      url,
      size: buffer.length,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.storageDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(key: string): string {
    const normalizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      return `${this.baseUrl}/${normalizedKey}`;
    }
    return `/uploads/${normalizedKey}`;
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.storageDir, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
