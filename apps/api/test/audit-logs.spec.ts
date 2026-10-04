import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogsService } from '../src/audit-logs/audit-logs.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuditLogsService (Retention & Cursor Pagination)', () => {
  let service: AuditLogsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        findMany: vi.fn(),
        count: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
      },
    };

    service = new AuditLogsService(mockPrisma as unknown as PrismaService);
  });

  it('should query logs strictly within 7-day retention cutoff', async () => {
    const mockLogs = [
      {
        id: 'log1',
        action: 'AUTH_LOGIN',
        resource: 'User',
        createdAt: new Date(),
        user: { name: 'Admin', email: 'admin@nexusnation.in', role: 'ADMIN' },
      },
    ];

    mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);
    mockPrisma.auditLog.count.mockResolvedValue(1);

    const result = await service.findAll({ limit: 10 });

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalled();
    const findArgs = mockPrisma.auditLog.findMany.mock.calls[0][0];
    expect(findArgs.where.createdAt.gte).toBeInstanceOf(Date);
    expect(result.items).toHaveLength(1);
    expect(result.meta.retentionDays).toBe(7);
    expect(result.meta.total).toBe(1);
  });

  it('should calculate hasNextPage and nextCursor when exceeding page limit', async () => {
    const rawItems = [
      { id: '1', action: 'AUTH_LOGIN', createdAt: new Date() },
      { id: '2', action: 'AUTH_LOGIN', createdAt: new Date() },
      { id: '3', action: 'AUTH_LOGIN', createdAt: new Date() }, // 3rd item indicates page has next
    ];

    mockPrisma.auditLog.findMany.mockResolvedValue(rawItems);
    mockPrisma.auditLog.count.mockResolvedValue(10);

    const result = await service.findAll({ limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.meta.hasNextPage).toBe(true);
    expect(result.meta.nextCursor).toBe('2');
  });

  it('should apply action and search filters properly in Prisma where clause', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(0);

    await service.findAll({
      limit: 20,
      action: 'AUTH_LOGIN',
      search: 'alex',
      cursor: 'cursor_abc',
    });

    const findArgs = mockPrisma.auditLog.findMany.mock.calls[0][0];
    expect(findArgs.where.action).toBe('AUTH_LOGIN');
    expect(findArgs.where.OR).toBeDefined();
    expect(findArgs.cursor).toEqual({ id: 'cursor_abc' });
    expect(findArgs.skip).toBe(1);
  });
});
