import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppService } from '../src/app.service';

describe('API readiness', () => {
  it('returns healthy only when the database is reachable', async () => {
    const service = new AppService({ isDatabaseReady: vi.fn().mockResolvedValue(true) } as any);

    await expect(service.getHealth()).resolves.toMatchObject({ status: 'ok' });
  });

  it('returns 503 when the database is unavailable', async () => {
    const service = new AppService({ isDatabaseReady: vi.fn().mockResolvedValue(false) } as any);

    await expect(service.getHealth()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
