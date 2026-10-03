import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const SENSITIVE_KEYS = ['brevoApiKey', 'smtpPassword', 'jwtSecret', 'adminSecret'];

@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Helper to mask sensitive strings for secure UI display
   */
  private maskSecret(val: string): string {
    if (!val || val.length < 8) return '********';
    return `${val.substring(0, 8)}...${val.substring(val.length - 4)}`;
  }

  /**
   * Get all system configuration keys merged with runtime defaults
   */
  async getAllSettings() {
    const dbSettings = await this.prisma.systemSetting.findMany();
    const settingsMap: Record<string, { value: string; isSecret: boolean; isSet: boolean }> = {};

    dbSettings.forEach((item) => {
      settingsMap[item.key] = {
        value: item.isSecret ? this.maskSecret(item.value) : item.value,
        isSecret: item.isSecret,
        isSet: Boolean(item.value && item.value.trim().length > 0),
      };
    });

    // Provide robust defaults for all dev configuration fields
    const defaultKeys: Record<string, { defaultValue: string; isSecret: boolean; description: string }> = {
      brevoApiKey: {
        defaultValue: process.env.BREVO_API_KEY ? this.maskSecret(process.env.BREVO_API_KEY) : '',
        isSecret: true,
        description: 'Brevo API Key (v3) for email dispatch',
      },
      brevoSenderEmail: {
        defaultValue: process.env.BREVO_SENDER_EMAIL || 'newsletter@nexusnation.in',
        isSecret: false,
        description: 'Verified sender email address registered in Brevo',
      },
      brevoSenderName: {
        defaultValue: process.env.BREVO_SENDER_NAME || 'NexusNation Engineering Dispatch',
        isSecret: false,
        description: 'Sender display name appearing in subscriber inboxes',
      },
      mailProvider: {
        defaultValue: 'brevo',
        isSecret: false,
        description: 'Primary email service provider (brevo, mock, custom)',
      },
      siteUrl: {
        defaultValue:
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.SITE_URL ||
          'https://nexusnation.in',
        isSecret: false,
        description: 'Public production URL for canonical links, sitemaps, and dispatch footers',
      },
      siteName: {
        defaultValue: 'NexusBlog',
        isSecret: false,
        description: 'Global portal branding name',
      },
      newsletterAutoWelcome: {
        defaultValue: 'true',
        isSecret: false,
        description: 'Send automated welcome email upon subscriber registration',
      },
      maintenanceMode: {
        defaultValue: 'false',
        isSecret: false,
        description: 'Put portal into maintenance mode for critical upgrades',
      },
      robotsIndexingMode: {
        defaultValue: 'allow',
        isSecret: false,
        description:
          'Search engine indexing policy: "allow" (Production), "disallow_all" (Dev/Testing Block), or "custom" (Custom Directives)',
      },
      robotsCustomContent: {
        defaultValue:
          '# Custom robots.txt directives\nUser-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/*',
        isSecret: false,
        description: 'Custom robots.txt directives when Indexing Mode is set to custom',
      },
    };

    const sanitizeSiteUrl = (raw?: string): string => {
      if (raw && !raw.includes('localhost') && !raw.includes('127.0.0.1')) {
        return raw.trim().replace(/\/+$/, '');
      }
      return (
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.SITE_URL ||
        'https://nexusnation.in'
      ).replace(/\/+$/, '');
    };

    const result: Record<string, any> = {};

    for (const [key, meta] of Object.entries(defaultKeys)) {
      if (settingsMap[key]) {
        let val = settingsMap[key].value;
        if (key === 'siteUrl') {
          val = sanitizeSiteUrl(val);
        }
        result[key] = {
          value: val,
          isSecret: meta.isSecret,
          isSet: settingsMap[key].isSet,
          description: meta.description,
        };
      } else {
        const envVal = process.env[key.toUpperCase()] || meta.defaultValue;
        let finalVal = meta.isSecret && envVal ? this.maskSecret(envVal) : envVal;
        if (key === 'siteUrl') {
          finalVal = sanitizeSiteUrl(finalVal);
        }
        result[key] = {
          value: finalVal,
          isSecret: meta.isSecret,
          isSet: Boolean(envVal && envVal.length > 0),
          description: meta.description,
        };
      }
    }

    return result;
  }

  /**
   * Batch update system configuration keys
   */
  async updateBatch(updates: Record<string, any>) {
    const operations: Promise<any>[] = [];

    for (const [key, rawValue] of Object.entries(updates)) {
      if (rawValue === undefined || rawValue === null) continue;
      let strValue = String(rawValue).trim();

      if (key === 'siteUrl' && (strValue.includes('localhost') || strValue.includes('127.0.0.1') || !strValue)) {
        strValue = 'https://nexusnation.in';
      }

      // If user submitted masked placeholder string (e.g. contains '...'), skip updating the secret
      if (SENSITIVE_KEYS.includes(key) && strValue.includes('...')) {
        continue;
      }

      const isSecret = SENSITIVE_KEYS.includes(key);

      operations.push(
        this.prisma.systemSetting.upsert({
          where: { key },
          update: {
            value: strValue,
            isSecret,
            updatedAt: new Date(),
          },
          create: {
            key,
            value: strValue,
            isSecret,
          },
        }),
      );
    }

    await Promise.all(operations);
    return {
      success: true,
      message: 'Developer system configuration saved successfully.',
    };
  }

  /**
   * Verify Brevo API connection
   */
  async testBrevoConnection(customApiKey?: string) {
    return this.mailService.verifyBrevoAccount(customApiKey);
  }

  /**
   * Send a test email via configured MailService
   */
  async sendTestMail(recipientEmail: string) {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new BadRequestException('A valid recipient email address is required');
    }

    return this.mailService.sendTestEmail(recipientEmail);
  }

  /**
   * Get live platform and database health diagnostics
   */
  async getSystemDiagnostics() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      dbLatencyMs = Date.now() - startTime;
    } catch {
      dbStatus = 'degraded';
      dbLatencyMs = Date.now() - startTime;
    }

    const [articlesCount, subscribersCount, seriesCount] = await Promise.all([
      this.prisma.article.count().catch(() => 0),
      this.prisma.newsletterSubscriber.count().catch(() => 0),
      this.prisma.series.count().catch(() => 0),
    ]);

    const mailConfig = await this.mailService.getConfig();

    return {
      database: {
        engine: 'MongoDB',
        status: dbStatus,
        latencyMs: dbLatencyMs,
        articlesCount,
        subscribersCount,
        seriesCount,
      },
      emailService: {
        provider: 'Brevo (Sendinblue) REST API v3',
        senderEmail: mailConfig.brevoSenderEmail,
        senderName: mailConfig.brevoSenderName,
        isApiKeySet: Boolean(mailConfig.brevoApiKey && mailConfig.brevoApiKey.length > 5),
      },
      runtime: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    };
  }

  /**
   * Reset developer settings to default parameters
   */
  async resetDefaults() {
    await this.prisma.systemSetting.deleteMany({
      where: {
        key: {
          in: [
            'brevoSenderEmail',
            'brevoSenderName',
            'siteUrl',
            'siteName',
            'newsletterAutoWelcome',
            'maintenanceMode',
            'robotsIndexingMode',
            'robotsCustomContent',
          ],
        },
      },
    });

    return {
      success: true,
      message: 'System runtime configuration reset to default parameters.',
    };
  }

  /**
   * Get public system runtime parameters (maintenance mode status, basic branding, robots policy)
   */
  async getPublicSettings() {
    const dbSettings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'maintenanceMode',
            'siteName',
            'siteUrl',
            'robotsIndexingMode',
            'robotsCustomContent',
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    dbSettings.forEach((item) => {
      settingsMap[item.key] = item.value;
    });

    const maintenanceMode =
      (settingsMap.maintenanceMode !== undefined
        ? settingsMap.maintenanceMode
        : process.env.MAINTENANCE_MODE || 'false') === 'true';

    const siteName =
      settingsMap.siteName || process.env.SITE_NAME || 'NexusBlog';

    let rawSiteUrl =
      settingsMap.siteUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      'https://nexusnation.in';

    if (!rawSiteUrl || rawSiteUrl.includes('localhost') || rawSiteUrl.includes('127.0.0.1')) {
      rawSiteUrl = 'https://nexusnation.in';
    }
    const siteUrl = rawSiteUrl.trim().replace(/\/+$/, '');

    const robotsIndexingMode =
      settingsMap.robotsIndexingMode ||
      process.env.ROBOTS_INDEXING_MODE ||
      'allow';

    const robotsCustomContent =
      settingsMap.robotsCustomContent ||
      process.env.ROBOTS_CUSTOM_CONTENT ||
      '# Custom robots.txt directives\nUser-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /api/*';

    return {
      maintenanceMode,
      siteName,
      siteUrl,
      robotsIndexingMode,
      robotsCustomContent,
    };
  }
}

