import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase().trim() },
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
        email: email.toLowerCase().trim(),
        active: true,
      },
    });

    return { message: 'Subscribed successfully to the Engineering Dispatch' };
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
}
