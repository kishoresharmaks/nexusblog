import { test, expect } from '@playwright/test';

test.describe('Guest Post & Contributor Workflow', () => {
  test('should display contributor landing page with editorial standards', async ({ page }) => {
    await page.goto('/write-for-us');

    await expect(page.getByRole('heading', { name: /Publish Your Engineering Insights/i })).toBeVisible();
    await expect(page.getByText(/Editorial Standards/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Writing/i })).toBeVisible();
  });

  test('should render dual-pane submission editor with live MDX preview', async ({ page }) => {
    await page.goto('/guest-post/submit');

    await expect(page.getByRole('heading', { name: /Submit Technical Guide/i })).toBeVisible();
    await expect(page.getByPlaceholder(/e.g. Scaling Kafka Consumers to 1M msgs\/sec/i)).toBeVisible();
    await expect(page.getByText(/Live Preview/i)).toBeVisible();
  });
});
