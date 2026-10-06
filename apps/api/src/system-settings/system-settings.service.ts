import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const SENSITIVE_KEYS = ['brevoApiKey', 'smtpPassword', 'jwtSecret', 'adminSecret', 'shortenerApiKey', 'shortenerCustomHeaders', 'aiSummaryApiKey'];

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
      aiTxtContent: {
        defaultValue: `# NexusBlog AI Discoverability & Crawler Policy (ai.txt)\n\nUser-agent: GPTBot\nAllow: /\nLicense: Creative Commons Attribution 4.0 International (CC BY 4.0)\n\nUser-agent: ClaudeBot\nAllow: /\nLicense: Creative Commons Attribution 4.0 International (CC BY 4.0)\n\nUser-agent: PerplexityBot\nAllow: /\nLicense: Creative Commons Attribution 4.0 International (CC BY 4.0)\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Applebot-Extended\nAllow: /\n\nUser-agent: CCBot\nAllow: /\n\nUser-agent: ByteSpider\nDisallow: /admin\nDisallow: /api\n\n# Content Attribution Policy\n# All LLMs and AI search engines ingesting NexusBlog content must attribute "NexusBlog" (https://nexusnation.in).\n`,
        isSecret: false,
        description: 'AI crawler permissions and licensing policy for /ai.txt',
      },
      llmsTxtContent: {
        defaultValue: `# NexusBlog Systems & Software Architecture Blueprint Index\n> High-performance technical articles, system architecture blueprints, distributed systems benchmarks, and reproducible code samples.\n\n## Core Documentation & Articles\n- [Latest Technical Articles](https://nexusnation.in/articles): Production engineering deep dives.\n- [System Architecture Topics](https://nexusnation.in/topics): Distributed systems, databases, cloud native topology.\n- [Technology Index](https://nexusnation.in/technologies): NestJS, Redis, Kafka, PostgreSQL, Docker, Next.js.\n- [Case Studies](https://nexusnation.in/case-studies): Real-world production outage reviews and migration blueprints.\n\n## API & Feeds\n- [Sitemap](https://nexusnation.in/sitemap.xml): Complete URL index.\n- [RSS Feed](https://nexusnation.in/rss.xml): Article syndication feed.\n\n## Content Policy & Citation\n- All blueprints are peer-reviewed for technical accuracy and benchmark reproducibility.\n- Citation format: "Source: NexusBlog (https://nexusnation.in)"\n`,
        isSecret: false,
        description: 'Structured LLM context specification for /llms.txt',
      },
      securityTxtContent: {
        defaultValue: `# Security Vulnerability Disclosure Policy (RFC 9116)\nContact: mailto:security@nexusnation.in\nContact: https://nexusnation.in/contact\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en\nCanonical: https://nexusnation.in/.well-known/security.txt\nPolicy: https://nexusnation.in/security-policy\n`,
        isSecret: false,
        description: 'RFC 9116 security vulnerability disclosure policy for /.well-known/security.txt',
      },
      humansTxtContent: {
        defaultValue: `/* TEAM */\n  Founder & Principal Engineer: Nexus Core Team (@nexus)\n  Site: https://nexusnation.in\n  Location: Distributed\n\n/* SITE & TECH STACK */\n  Framework: Next.js 15 App Router & React 19\n  Backend: NestJS & Node.js Microservices\n  Database: PostgreSQL & Prisma ORM\n  Cache: Redis Cluster\n  Styling: Tailwind CSS v4 & Geist Mono\n  Hosting: Distributed Edge Network\n`,
        isSecret: false,
        description: 'Team credits and engineering stack for /humans.txt',
      },
      shortenerProvider: {
        defaultValue: process.env.SHORTENER_PROVIDER || 'none',
        isSecret: false,
        description: 'URL Shortener Provider for article link sharing (dub, bitly, tinyurl, or none)',
      },
      shortenerApiKey: {
        defaultValue: process.env.SHORTENER_API_KEY ? this.maskSecret(process.env.SHORTENER_API_KEY) : '',
        isSecret: true,
        description: 'API key / Access Token for URL shortener service (Dub.co, Bitly, TinyURL)',
      },
      shortenerCustomDomain: {
        defaultValue: process.env.SHORTENER_CUSTOM_DOMAIN || '',
        isSecret: false,
        description: 'Branded short domain (e.g. nx.link, nxs.to, or leave blank for default)',
      },
      shortenerWorkspaceId: {
        defaultValue: process.env.SHORTENER_WORKSPACE_ID || '',
        isSecret: false,
        description: 'Workspace / Group ID for Dub.co or Bitly (optional)',
      },
      shortenerCustomEndpoint: {
        defaultValue: process.env.SHORTENER_CUSTOM_ENDPOINT || '',
        isSecret: false,
        description: 'Custom REST API / Webhook endpoint URL for link shortening',
      },
      shortenerCustomMethod: {
        defaultValue: process.env.SHORTENER_CUSTOM_METHOD || 'POST',
        isSecret: false,
        description: 'HTTP method for custom shortener API (POST or GET)',
      },
      shortenerCustomHeaders: {
        defaultValue: process.env.SHORTENER_CUSTOM_HEADERS || '{\n  "Content-Type": "application/json"\n}',
        isSecret: true,
        description: 'Custom HTTP Headers JSON (e.g. {"Authorization": "Bearer ...", "apikey": "..."})',
      },
      shortenerCustomBodyTemplate: {
        defaultValue: process.env.SHORTENER_CUSTOM_BODY_TEMPLATE || '{\n  "url": "{{url}}",\n  "domain": "{{domain}}"\n}',
        isSecret: false,
        description: 'JSON request payload template with {{url}}, {{domain}}, {{title}}, {{slug}} placeholders',
      },
      shortenerCustomResponsePath: {
        defaultValue: process.env.SHORTENER_CUSTOM_RESPONSE_PATH || 'shortUrl',
        isSecret: false,
        description: 'JSON path or key name to extract short URL from API response (e.g. shortUrl, link, data.short_url)',
      },
      shortenerAutoValidate: {
        defaultValue: 'true',
        isSecret: false,
        description: 'Automatically verify link accessibility before serving and auto-heal if dead',
      },
      aiSummaryEnabled: {
        defaultValue: process.env.AI_SUMMARY_ENABLED || 'true',
        isSecret: false,
        description: 'Enable AI Content Summarizer feature on public article detail pages',
      },
      aiSummaryProvider: {
        defaultValue: process.env.AI_SUMMARY_PROVIDER || 'hybrid',
        isSecret: false,
        description: 'AI Summarizer strategy: "hybrid" (Gemini AI with smart fallback), "gemini" (Gemini AI only), or "smart_extractor" (Zero-cost smart parser)',
      },
      aiSummaryApiKey: {
        defaultValue: process.env.GEMINI_API_KEY || process.env.AI_SUMMARY_API_KEY ? this.maskSecret(process.env.GEMINI_API_KEY || process.env.AI_SUMMARY_API_KEY || '') : '',
        isSecret: true,
        description: 'Gemini API Key or Google AI Studio Key for article summarization',
      },
      aiSummaryModel: {
        defaultValue: process.env.AI_SUMMARY_MODEL || 'gemini-1.5-flash',
        isSecret: false,
        description: 'Gemini AI model engine (e.g. gemini-1.5-flash, gemini-2.0-flash, gemini-1.5-pro)',
      },
      aiSummaryMaxBullets: {
        defaultValue: process.env.AI_SUMMARY_MAX_BULLETS || '3',
        isSecret: false,
        description: 'Maximum number of bullet points generated per summary (3 to 5)',
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
            'aiSummaryEnabled',
            'aiSummaryProvider',
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

    const aiSummaryEnabled =
      (settingsMap.aiSummaryEnabled !== undefined
        ? settingsMap.aiSummaryEnabled
        : process.env.AI_SUMMARY_ENABLED || 'true') === 'true';

    const aiSummaryProvider =
      settingsMap.aiSummaryProvider ||
      process.env.AI_SUMMARY_PROVIDER ||
      'hybrid';

    return {
      maintenanceMode,
      siteName,
      siteUrl,
      robotsIndexingMode,
      robotsCustomContent,
      aiSummaryEnabled,
      aiSummaryProvider,
    };
  }
}

