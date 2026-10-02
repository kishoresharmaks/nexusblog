import { describe, it, expect, vi } from 'vitest';
import { SystemSettingsService } from '../src/system-settings/system-settings.service';

describe('SystemSettingsService - Robots.txt & Dynamic Indexing', () => {
  it('should return default robots indexing settings in public settings when db is empty', async () => {
    const mockPrisma = {
      systemSetting: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };
    const mockMail = {
      getConfig: vi.fn(),
    };

    const service = new SystemSettingsService(mockPrisma as any, mockMail as any);
    const publicSettings = await service.getPublicSettings();

    expect(publicSettings).toBeDefined();
    expect(publicSettings.robotsIndexingMode).toBe('allow');
    expect(publicSettings.robotsCustomContent).toContain('User-Agent: *');
  });

  it('should return updated robots indexing settings from database', async () => {
    const mockPrisma = {
      systemSetting: {
        findMany: vi.fn().mockResolvedValue([
          { key: 'robotsIndexingMode', value: 'disallow_all' },
          { key: 'siteUrl', value: 'https://nexusnation.in' },
        ]),
      },
    };
    const mockMail = {
      getConfig: vi.fn(),
    };

    const service = new SystemSettingsService(mockPrisma as any, mockMail as any);
    const publicSettings = await service.getPublicSettings();

    expect(publicSettings.robotsIndexingMode).toBe('disallow_all');
    expect(publicSettings.siteUrl).toBe('https://nexusnation.in');
  });

  it('should upsert settings during batch update', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ id: '1' });
    const mockPrisma = {
      systemSetting: {
        upsert: upsertMock,
      },
    };
    const mockMail = {
      getConfig: vi.fn(),
    };

    const service = new SystemSettingsService(mockPrisma as any, mockMail as any);
    const result = await service.updateBatch({
      robotsIndexingMode: 'disallow_all',
      siteUrl: 'https://nexusnation.in',
    });

    expect(result.success).toBe(true);
    expect(upsertMock).toHaveBeenCalledTimes(2);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: 'robotsIndexingMode' },
        update: expect.objectContaining({ value: 'disallow_all' }),
      }),
    );
  });
});
