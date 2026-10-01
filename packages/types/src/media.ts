export type StorageProviderType = 'local' | 'r2' | 's3' | 'cloudinary';

export interface MediaVariant {
  name: 'original' | 'thumbnail' | 'small' | 'medium' | 'large' | 'og';
  width: number;
  height: number;
  format: 'avif' | 'webp' | 'jpeg' | 'png';
  size: number;
  storageKey: string;
  url: string;
}

export interface Media {
  id: string;
  storageKey: string;
  provider: StorageProviderType;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  caption?: string | null;
  blurHash?: string | null;
  variants: MediaVariant[];
  url: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
