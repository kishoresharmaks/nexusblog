export interface ShortenOptions {
  url: string;
  title?: string;
  slug?: string;
  articleId?: string;
  customDomain?: string;
  workspaceId?: string;
  apiKey?: string;
  customEndpoint?: string;
  customMethod?: string;
  customHeaders?: string;
  customBodyTemplate?: string;
  customResponsePath?: string;
  siteUrl?: string;
}

export interface ShortenerTestResult {
  success: boolean;
  message: string;
  sampleShortUrl?: string;
}

export interface IShortenerProvider {
  readonly name: string;
  generate(options: ShortenOptions): Promise<string | null>;
  testConnection?(options: ShortenOptions): Promise<ShortenerTestResult>;
}
