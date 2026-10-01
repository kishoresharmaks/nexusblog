import { test, expect } from '@playwright/test';

test.describe('Public Articles & MDX Reader Experience', () => {
  test('should display article directory with search filters and tags', async ({ page }) => {
    await page.goto('/articles');

    await expect(page.getByRole('heading', { name: /Technical Articles & Architecture Deep Dives/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Filter by title, topic, or keyword/i)).toBeVisible();
  });

  test('should render 3-column article reading experience with sticky TOC and diagrams', async ({ page }) => {
    await page.goto('/articles/building-distributed-rate-limiter-redis-nestjs');

    // Title & Metadata
    await expect(
      page.getByRole('heading', { name: /Building a Distributed Rate Limiter with Redis & NestJS/i }),
    ).toBeVisible();

    // Table of Contents
    await expect(page.getByText(/Table of Contents/i)).toBeVisible();

    // Interactive Diagram Canvas
    await expect(page.getByText(/Distributed Microservice & Cache Cluster Topology/i)).toBeVisible();
  });

  test('should load category and technology taxonomy hubs', async ({ page }) => {
    await page.goto('/categories');
    await expect(page.getByRole('heading', { name: /Architecture Domains/i })).toBeVisible();

    await page.goto('/technologies');
    await expect(page.getByRole('heading', { name: /Technology Ecosystem/i })).toBeVisible();
  });
});
