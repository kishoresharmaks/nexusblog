import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NewsletterService } from '../src/newsletter/newsletter.service';
import { EmailTemplateBuilder } from '../src/mail/email-template.builder';
import { buildNewsletterUtmUrl } from '../src/newsletter/strategies/newsletter-generator.strategy';

describe('Newsletter & Email Template System', () => {
  let newsletterService: NewsletterService;
  let mockPrisma: any;
  let mockMailService: any;

  beforeEach(() => {
    mockPrisma = {
      systemSetting: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      article: {
        findFirst: vi.fn().mockImplementation(async ({ where }) => {
          return {
            id: 'art-hero-1',
            title: 'Designing Multi-Region Distributed CockroachDB',
            slug: 'designing-multi-region-cockroachdb',
            excerpt: 'How to survive regional network partitions with minimal p99 latency.',
            coverImage: '/uploads/cockroach.png',
            category: { name: 'System Design', slug: 'system-design' },
            author: { name: 'Staff Architect' },
            viewsCount: 4200,
            readingTime: 7,
            difficulty: 'ADVANCED',
            keyTakeaways: [
              'Deploy Raft consensus across 3 availability zones.',
              'Use leaseholder rebalancing under network partition.',
            ],
            prerequisites: ['Distributed Consensus', 'Raft Algorithm'],
          };
        }),
        findMany: vi.fn().mockImplementation(async ({ orderBy }) => {
          return [
            {
              id: 'art-1',
              title: 'Zero-Copy Serialization in Rust and Go',
              slug: 'zero-copy-serialization',
              excerpt: 'Comparing FlatBuffers, Capn Proto, and memory alignment.',
              coverImage: '/uploads/zerocopy.png',
              category: { name: 'Performance', slug: 'performance' },
              viewsCount: 3100,
              readingTime: 5,
              difficulty: 'INTERMEDIATE',
            },
            {
              id: 'art-2',
              title: 'eBPF Kernel Profiling at Scale',
              slug: 'ebpf-kernel-profiling',
              excerpt: 'Tracing network packet drops without kernel overhead.',
              coverImage: null,
              category: { name: 'Low Level', slug: 'low-level' },
              viewsCount: 2800,
              readingTime: 8,
              difficulty: 'ADVANCED',
            },
          ];
        }),
      },
      newsletterSubscriber: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sub-1', email: 'test@example.com' }),
        findMany: vi.fn().mockResolvedValue([
          { id: 'sub-1', email: 'eng1@example.com', active: true },
          { id: 'sub-2', email: 'eng2@example.com', active: true },
        ]),
        count: vi.fn().mockResolvedValue(2),
        update: vi.fn().mockResolvedValue({ id: 'sub-1', active: true }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        delete: vi.fn().mockResolvedValue({ id: 'sub-1' }),
      },
      newsletterCampaign: {
        create: vi.fn().mockResolvedValue({ id: 'camp-101' }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 'camp-101',
            subject: 'NexusBlog Dispatch #1',
            sentCount: 2,
            failedCount: 0,
            totalRecipients: 2,
            dispatchedAt: new Date(),
          },
        ]),
        count: vi.fn().mockResolvedValue(1),
        findUnique: vi.fn().mockResolvedValue({
          id: 'camp-101',
          subject: 'NexusBlog Dispatch #1',
          sentCount: 2,
          failedCount: 0,
          totalRecipients: 2,
        }),
      },
    };

    mockMailService = {
      getConfig: vi.fn().mockResolvedValue({
        brevoApiKey: 'test-key',
        brevoSenderEmail: 'newsletter@nexusnation.in',
        brevoSenderName: 'NexusBlog Engineering Dispatch',
        mailProvider: 'brevo',
        siteUrl: 'https://nexusnation.in',
      }),
      sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-test-1' }),
      sendBroadcast: vi.fn().mockResolvedValue({
        success: true,
        provider: 'brevo',
        totalRecipients: 2,
        sentCount: 2,
        failedCount: 0,
        campaignId: 'camp-101',
        message: 'Dispatched successfully',
      }),
    };

    newsletterService = new NewsletterService(mockPrisma, mockMailService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EmailTemplateBuilder', () => {
    it('should build responsive dark theme HTML with hero article and takeaways', () => {
      const builder = new EmailTemplateBuilder()
        .setSubject('Weekly Architecture Dispatch')
        .setPreviewText('In-depth Raft consensus breakdown')
        .setHeader({ siteName: 'NexusBlog', editionTag: 'Weekly Dispatch' })
        .setHeroArticle({
          title: 'Distributed Consensus with CockroachDB',
          excerpt: 'Surviving WAN partitions',
          slug: 'distributed-consensus',
          url: 'https://nexusnation.in/articles/distributed-consensus?utm_source=newsletter',
          category: 'System Design',
          readingTime: 6,
          difficulty: 'ADVANCED',
        })
        .setSecondaryArticles([
          {
            title: 'Zero-Copy Serialization',
            slug: 'zero-copy',
            url: 'https://nexusnation.in/articles/zero-copy',
            category: 'Performance',
            readingTime: 4,
          },
        ])
        .setKeyTakeaways(['Use 3 availability zones', 'Set timeout budgets']);

      const html = builder.compileHtml();
      const markdown = builder.compileMarkdown();

      // Verify HTML fidelity
      expect(html).toContain('N</span>EXUS');
      expect(html).toContain('Weekly Dispatch');
      expect(html).toContain('Distributed Consensus with CockroachDB');
      expect(html).toContain('Zero-Copy Serialization');
      expect(html).toContain('Architectural Takeaways');
      expect(html).toContain('Unsubscribe');
      expect(html).toContain('#09090b'); // Dark theme background
      expect(html).toContain('#121215'); // Card background
      expect(html).toContain('#22d3ee'); // Cyan brand highlight

      // Verify Markdown fidelity
      expect(markdown).toContain('## 🌟 Featured Article: [Distributed Consensus with CockroachDB]');
      expect(markdown).toContain('## 📚 More from Nexus');
      expect(markdown).toContain('## 💡 Key Architectural Takeaways');
    });
  });

  describe('UTM Attribution Helper', () => {
    it('should append clean standard UTM parameters to article URLs', () => {
      const utmUrl = buildNewsletterUtmUrl(
        'https://nexusnation.in/articles/raft-consensus',
        'weekly_dispatch_2026_10',
        'hero_cta',
      );

      expect(utmUrl).toContain('utm_source=nexusblog_newsletter');
      expect(utmUrl).toContain('utm_medium=email');
      expect(utmUrl).toContain('utm_campaign=weekly_dispatch_2026_10');
      expect(utmUrl).toContain('utm_content=hero_cta');
    });
  });

  describe('NewsletterService.generateTemplate', () => {
    it('should generate Weekly Digest preset with Hero article and secondary grid from database', async () => {
      const result = await newsletterService.generateTemplate({
        preset: 'weekly_digest',
      });

      expect(result.preset).toBe('weekly_digest');
      expect(result.subject).toContain('Designing Multi-Region Distributed CockroachDB');
      expect(result.articles).toHaveLength(3);
      expect(result.articleIds).toContain('art-hero-1');
      expect(result.htmlContent).toContain('Engineering Dispatch');
      expect(result.markdownContent).toContain('Key Architectural Takeaways');
    });

    it('should generate Spotlight preset focusing on a single system design article', async () => {
      const result = await newsletterService.generateTemplate({
        preset: 'spotlight',
      });

      expect(result.preset).toBe('spotlight');
      expect(result.subject).toContain('Architectural Deep Dive: Designing Multi-Region');
      expect(result.articles).toHaveLength(1);
      expect(result.articles[0].id).toBe('art-hero-1');
    });

    it('should generate Trending Roundup preset ranking articles by views', async () => {
      const result = await newsletterService.generateTemplate({
        preset: 'trending_roundup',
      });

      expect(result.preset).toBe('trending_roundup');
      expect(result.subject).toContain('Top Trending Tech Guides');
      expect(result.articles.length).toBeGreaterThan(0);
    });
  });

  describe('NewsletterService.broadcast & getStats', () => {
    it('should dispatch broadcast via MailService and return campaign metrics', async () => {
      const result = await newsletterService.broadcast({
        subject: 'Weekly Dispatch #42',
        content: '## Hello Engineers\n\nContent here.',
        articleIds: ['art-hero-1'],
      });

      expect(result.success).toBe(true);
      expect(result.totalRecipients).toBe(2);
      expect(result.sentCount).toBe(2);
      expect(mockMailService.sendBroadcast).toHaveBeenCalled();
    });

    it('should aggregate lifetime campaign stats and delivery rates', async () => {
      const stats = await newsletterService.getStats();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.totalCampaigns).toBe(1);
      expect(stats.lifetimeDelivered).toBe(2);
      expect(stats.deliveryRate).toBe(100);
    });
  });
});
