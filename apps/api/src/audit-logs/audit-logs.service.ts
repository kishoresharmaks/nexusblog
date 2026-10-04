import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

const RETENTION_DAYS = 7;

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns security audit logs within the 7-day retention window with cursor-based pagination.
   * Also asynchronously purges logs older than 7 days to maintain database hygiene.
   */
  async findAll(query: QueryAuditLogsDto = { limit: 50 }) {
    const limit = Math.min(Math.max(query.limit || 50, 1), 100);
    const cursor = query.cursor?.trim();
    const action = query.action?.trim();
    const search = query.search?.trim();

    // Enforce strict 7-day retention cutoff
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Build filter condition
    const where: any = {
      createdAt: { gte: cutoffDate },
    };

    if (action && action.toUpperCase() !== 'ALL') {
      where.action = action;
    }

    if (search && search.length > 0) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Trigger non-blocking purge of expired logs older than 7 days
    this.purgeExpiredLogs(cutoffDate).catch((err) => {
      this.logger.warn(`Failed to purge expired audit logs: ${(err as Error).message}`);
    });

    // Execute cursor query & total count in parallel
    const [rawItems, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const hasNextPage = rawItems.length > limit;
    const items = hasNextPage ? rawItems.slice(0, limit) : rawItems;
    const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      meta: {
        total,
        limit,
        hasNextPage,
        nextCursor,
        retentionDays: RETENTION_DAYS,
      },
    };
  }

  /**
   * Purge logs older than retention window (7 days)
   */
  async purgeExpiredLogs(cutoffDate: Date) {
    try {
      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Purged ${result.count} audit logs older than ${RETENTION_DAYS} days.`);
      }
    } catch (e) {
      this.logger.warn(`Purge expired logs error: ${(e as Error).message}`);
    }
  }
}
