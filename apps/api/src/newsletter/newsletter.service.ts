import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async subscribe(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (!existing.active) {
        await this.prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: { active: true, unsubscribedAt: null },
        });
      }
      return { message: 'Subscribed successfully' };
    }

    await this.prisma.newsletterSubscriber.create({
      data: {
        email: normalizedEmail,
        active: true,
      },
    });

    // Send welcome email in background
    this.sendWelcomeEmail(normalizedEmail).catch(() => {});

    return { message: 'Subscribed successfully to the Engineering Dispatch' };
  }

  private async sendWelcomeEmail(email: string) {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: 'newsletterAutoWelcome' },
      });
      if (setting && setting.value === 'false') {
        return; // Auto-welcome email disabled by admin
      }

      const welcomeMarkdown = `## Welcome to the NexusBlog Engineering Dispatch!\n\nThank you for subscribing to our weekly deep-dives into distributed systems, low-level architecture, performance optimizations, and infrastructure blueprints.\n\n### What to expect:\n- **Weekly Blueprints**: In-depth breakdowns of real-world scalable architectures.\n- **Low-level Engineering**: eBPF, Rust, Go concurrency, memory models, and zero-allocation patterns.\n- **Zero Fluff**: 100% signal for engineers and system designers.\n\nHappy building,\n**NexusBlog Core Architecture Team**`;

      await this.mailService.sendEmail({
        to: email,
        subject: 'Welcome to NexusBlog Engineering Dispatch',
        previewText: 'Welcome to high-signal technical deep-dives and architectural blueprints.',
        textContent: welcomeMarkdown,
      });
    } catch {
      // Non-blocking welcome email
    }
  }

  async findAll(limit = 100, skip = 0) {
    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.newsletterSubscriber.count(),
    ]);

    return {
      items,
      total,
      limit,
      skip,
    };
  }

  async unsubscribe(email: string) {
    await this.prisma.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase().trim() },
      data: { active: false, unsubscribedAt: new Date() },
    });

    return { message: 'Unsubscribed successfully' };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { active: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      estimatedOpenRate: 54.2,
      estimatedCtr: 19.8,
    };
  }

  async broadcast(payload: { subject: string; content: string; previewText?: string; testEmail?: string }) {
    // If testEmail is provided, send only to the test recipient
    if (payload.testEmail && payload.testEmail.includes('@')) {
      const testResult = await this.mailService.sendEmail({
        to: payload.testEmail,
        subject: `[Test Dispatch] ${payload.subject}`,
        previewText: payload.previewText,
        textContent: payload.content,
      });

      return {
        success: testResult.success,
        isTest: true,
        subject: payload.subject,
        recipient: payload.testEmail,
        messageId: testResult.messageId,
        message: testResult.success
          ? `Test dispatch sent successfully to ${payload.testEmail}`
          : `Failed to send test email: ${testResult.error}`,
      };
    }

    const activeSubscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { active: true },
      select: { email: true },
    });

    const recipientEmails = activeSubscribers.map((s) => s.email);

    const result = await this.mailService.sendBroadcast({
      subject: payload.subject,
      content: payload.content,
      previewText: payload.previewText,
      recipients: recipientEmails,
    });

    return {
      success: result.success,
      provider: result.provider,
      subject: payload.subject,
      previewText: payload.previewText,
      totalRecipients: result.totalRecipients,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      dispatchedAt: new Date().toISOString(),
      message: result.message,
    };
  }

  async deleteSubscriber(id: string) {
    await this.prisma.newsletterSubscriber.delete({
      where: { id },
    });
    return { success: true, message: 'Subscriber removed' };
  }
}

