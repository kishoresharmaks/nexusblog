import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import * as https from 'node:https';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class IncidentSourcesService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IncidentSourcesService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly prisma: PrismaService, private readonly mail: MailService) {}

  onModuleInit() {
    void this.run();
    this.timer = setInterval(() => void this.run(), 60 * 60 * 1000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    try {
      await this.archivePendingSources();
      await this.checkSourceLinks();
      await this.alertArchiveFailures();
    } catch (error) {
      this.logger.error(`Incident source maintenance failed: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  private async archivePendingSources() {
    const retryBefore = new Date(Date.now() - DAY);
    const sources = await this.prisma.incidentSource.findMany({
      where: {
        archiveStatus: { in: ['PENDING', 'FAILED'] },
        OR: [{ archiveCheckedAt: null }, { archiveCheckedAt: { lt: retryBefore } }],
      },
      take: 20,
      orderBy: { createdAt: 'asc' },
    });
    const publishedIds = await this.publishedSourceIds(sources.map(({ id }) => id));

    for (const source of sources) {
      if (publishedIds.has(source.id)) await this.archive(source);
    }
  }

  async archiveNow(urls: string[]) {
    const uniqueUrls = [...new Set(urls)];
    if (!uniqueUrls.length) return;
    const sources = await this.prisma.incidentSource.findMany({ where: { url: { in: uniqueUrls } } });
    for (const source of sources) await this.archive(source);
  }

  private async archive(source: { id: string; url: string }) {
    try {
      await this.resolvePublicAddress(new URL(source.url));
      const response = await fetch(`https://web.archive.org/save/${source.url}`, {
        signal: AbortSignal.timeout(30_000),
      });
      const snapshot = response.url.match(/https:\/\/web\.archive\.org\/web\/\d+[^/]*\/.+/)?.[0];
      await this.prisma.incidentSource.update({
        where: { id: source.id },
        data: {
          archiveAttempts: { increment: 1 },
          archiveCheckedAt: new Date(),
          archiveStatus: response.ok && snapshot ? 'ARCHIVED' : 'FAILED',
          archiveUrl: response.ok && snapshot ? snapshot : null,
          archivedAt: response.ok && snapshot ? new Date() : null,
        },
      });
    } catch (error) {
      await this.prisma.incidentSource.update({
        where: { id: source.id },
        data: { archiveAttempts: { increment: 1 }, archiveCheckedAt: new Date(), archiveStatus: 'FAILED' },
      });
      this.logger.warn(`Could not archive incident source ${source.id}: ${(error as Error).message}`);
    }
  }

  private async checkSourceLinks() {
    const weekAgo = new Date(Date.now() - 7 * DAY);
    const sources = await this.prisma.incidentSource.findMany({
      where: { OR: [{ linkCheckedAt: null }, { linkCheckedAt: { lt: weekAgo } }] },
      take: 25,
      orderBy: { linkCheckedAt: 'asc' },
    });
    const publishedIds = await this.publishedSourceIds(sources.map(({ id }) => id));

    for (const source of sources) {
      if (!publishedIds.has(source.id)) continue;
      try {
        const result = await this.checkPublicUrl(source.url);
        await this.prisma.incidentSource.update({
          where: { id: source.id },
          data: {
            linkStatus: result.statusCode < 400 ? 'OK' : 'BROKEN',
            linkStatusCode: result.statusCode,
            linkCheckedAt: new Date(),
          },
        });
      } catch (error) {
        await this.prisma.incidentSource.update({
          where: { id: source.id },
          data: { linkStatus: 'BROKEN', linkStatusCode: null, linkCheckedAt: new Date() },
        });
        this.logger.warn(`Incident source link check failed for ${source.id}: ${(error as Error).message}`);
      }
    }
  }

  private async publishedSourceIds(ids: string[]) {
    if (!ids.length) return new Set<string>();
    const links = await this.prisma.incidentEventSource.findMany({
      where: { sourceId: { in: ids } },
      select: {
        sourceId: true,
        event: {
          select: {
            incident: {
              select: { article: { select: { type: true, status: true } } },
            },
          },
        },
      },
    });
    return new Set(links.filter(({ event }) => event.incident.article.type === 'INCIDENT' && event.incident.article.status === 'PUBLISHED').map(({ sourceId }) => sourceId));
  }

  private async alertArchiveFailures() {
    const sevenDaysAgo = new Date(Date.now() - 7 * DAY);
    const failed = await this.prisma.incidentSource.findMany({
      where: {
        archiveStatus: 'FAILED',
        archiveAlertedAt: null,
        createdAt: { lt: sevenDaysAgo },
      },
      select: { id: true, url: true },
      take: 50,
    });
    if (!failed.length) return;

    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] }, status: 'ACTIVE' },
      select: { email: true, name: true },
    });
    const recipients = admins.map(({ email, name }) => ({ email, name }));
    const result = recipients.length
      ? await this.mail.sendEmail({
          to: recipients,
          subject: 'Incident source archives need attention',
          textContent: `Wayback snapshots have failed for more than 7 days:\n\n${failed.map((item) => item.url).join('\n')}`,
        })
      : { success: false };

    if (!result.success) {
      this.logger.error(`${failed.length} incident source snapshots remain unavailable after 7 days; no alert email was delivered`);
    }
    await this.prisma.incidentSource.updateMany({
      where: { id: { in: failed.map(({ id }) => id) } },
      data: { archiveAlertedAt: new Date() },
    });
  }

  private async checkPublicUrl(input: string): Promise<{ statusCode: number }> {
    let current = new URL(input);
    for (let redirects = 0; redirects <= 5; redirects++) {
      const address = await this.resolvePublicAddress(current);
      let response = await this.request(current, address, 'HEAD');
      if ([403, 405, 501].includes(response.statusCode)) {
        response = await this.request(current, address, 'GET');
      }
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.location) {
        current = new URL(response.location, current);
        continue;
      }
      return { statusCode: response.statusCode };
    }
    throw new Error('Source redirected too many times');
  }

  private async resolvePublicAddress(url: URL): Promise<{ address: string; family: number }> {
    if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password) {
      throw new Error('Only public HTTPS sources on the standard port can be checked');
    }
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = isIP(hostname)
      ? [{ address: hostname, family: isIP(hostname) }]
      : await lookup(hostname, { all: true, verbatim: true });
    if (!addresses.length || addresses.some(({ address }) => !this.isPublicAddress(address))) {
      throw new Error('Source resolves to a non-public address');
    }
    return addresses[0];
  }

  private isPublicAddress(address: string): boolean {
    if (address.includes(':')) {
      const normalized = address.toLowerCase();
      if (normalized.startsWith('::ffff:')) return this.isPublicAddress(normalized.slice(7));
      return !(
        normalized === '::' || normalized === '::1' || normalized.startsWith('fc') ||
        normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
        normalized.startsWith('fea') || normalized.startsWith('feb') || normalized.startsWith('ff')
      );
    }
    const octets = address.split('.').map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
    const [a, b] = octets;
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }

  private request(url: URL, address: { address: string; family: number }, method: 'HEAD' | 'GET'): Promise<{ statusCode: number; location?: string }> {
    return new Promise((resolve, reject) => {
      const request = https.request(url, {
        method,
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
        timeout: 10_000,
        lookup: (_hostname: string, _options: unknown, callback: (error: Error | null, address: string, family: number) => void) =>
          callback(null, address.address, address.family),
      } as any, (response) => {
        if (method === 'GET') response.destroy();
        else response.resume();
        resolve({ statusCode: response.statusCode || 0, location: response.headers.location });
      });
      request.on('timeout', () => request.destroy(new Error('Source request timed out')));
      request.on('error', reject);
      request.end();
    });
  }
}
