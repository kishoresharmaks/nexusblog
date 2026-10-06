import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingsService } from '../system-settings/system-settings.service';

export const DEFAULT_INDEXNOW_KEY = 'nexusblog_indexnow_key_8f3a9e2d1c';
export const DEFAULT_INDEXNOW_HOST = 'nexusnation.in';

@Injectable()
export class IndexNowService {
  private readonly logger = new Logger(IndexNowService.name);

  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  public getIndexNowKey(): string {
    return process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
  }

  public getHostUrl(): string {
    const configured = process.env.SITE_URL || 'https://nexusnation.in';
    return configured.replace(/\/+$/, '');
  }

  /**
   * Submits a list of published canonical URLs to IndexNow for instant search engine indexing.
   */
  public async submitUrls(urls: string[]): Promise<boolean> {
    if (!urls || urls.length === 0) return false;

    const host = this.getHostUrl().replace(/^https?:\/\//, '');
    const key = this.getIndexNowKey();
    const keyLocation = `${this.getHostUrl()}/${key}.txt`;

    const payload = {
      host,
      key,
      keyLocation,
      urlList: urls,
    };

    this.logger.log(`Submitting ${urls.length} URL(s) to IndexNow protocol (host: ${host})...`);

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200 || response.status === 202) {
        this.logger.log(`IndexNow submission succeeded for ${urls.length} URL(s) (Status: ${response.status})`);
        return true;
      } else {
        const errText = await response.text().catch(() => '');
        this.logger.warn(`IndexNow submission response status ${response.status}: ${errText}`);
        return false;
      }
    } catch (err: any) {
      this.logger.error(`Failed to submit URLs to IndexNow protocol: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Helper to submit a single published article by slug asynchronously.
   */
  public async submitArticleUrl(slug: string): Promise<void> {
    const articleUrl = `${this.getHostUrl()}/articles/${slug}`;
    // Run asynchronously in background so client requests are not blocked
    setTimeout(() => {
      this.submitUrls([articleUrl]).catch(() => {});
    }, 100);
  }
}
