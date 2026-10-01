export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
}

export interface IStorageProvider {
  upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  exists(key: string): Promise<boolean>;
  getPresignedUploadUrl?(key: string, mimeType: string): Promise<PresignedUrlResult>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
