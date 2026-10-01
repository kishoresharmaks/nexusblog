import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ImageProcessorService } from './image-processor.service';
import { STORAGE_PROVIDER } from './providers/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { R2StorageProvider } from './providers/r2-storage.provider';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    ImageProcessorService,
    LocalStorageProvider,
    R2StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useFactory: (
        configService: ConfigService,
        localProvider: LocalStorageProvider,
        r2Provider: R2StorageProvider,
      ) => {
        const providerType = configService.get<string>('STORAGE_PROVIDER') || 'local';
        if (providerType === 'r2' || providerType === 's3') {
          return r2Provider;
        }
        return localProvider;
      },
      inject: [ConfigService, LocalStorageProvider, R2StorageProvider],
    },
  ],
  exports: [MediaService, STORAGE_PROVIDER],
})
export class MediaModule {}
