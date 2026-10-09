import { describe, it, expect } from 'vitest';
import { siteConfig } from './index';

describe('siteConfig', () => {
  it('should have standard required metadata fields', () => {
    expect(siteConfig.name).toBe('NexusNation');
    expect(siteConfig.url).toBeDefined();
    expect(siteConfig.description).toContain('Technical Publishing Platform');
  });

  it('should define core technical categories and technologies', () => {
    expect(Array.isArray(siteConfig.categories)).toBe(true);
    expect(siteConfig.categories).toContain('System Design');
    expect(siteConfig.categories).toContain('Distributed Systems');

    expect(Array.isArray(siteConfig.technologies)).toBe(true);
    expect(siteConfig.technologies).toContain('Redis');
    expect(siteConfig.technologies).toContain('NestJS');
  });

  it('should define author links and social metadata', () => {
    expect(siteConfig.links).toBeDefined();
    expect(siteConfig.links.github).toBeDefined();
    expect(siteConfig.links.twitter).toBeDefined();
  });
});
