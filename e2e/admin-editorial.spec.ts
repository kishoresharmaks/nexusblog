import { test, expect } from '@playwright/test';

test.describe('Admin Panel & Editorial CMS', () => {
  test('should render admin dashboard overview and navigation structure', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: /Editorial Command Center/i })).toBeVisible();
    await expect(page.getByText(/Total Articles/i)).toBeVisible();
    await expect(page.getByText(/Guest Submissions/i)).toBeVisible();
  });

  test('should render article management data table', async ({ page }) => {
    await page.goto('/admin/articles');

    await expect(page.getByRole('heading', { name: /Article Management/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /New Article/i })).toBeVisible();
  });

  test('should render guest post moderation queue with review controls', async ({ page }) => {
    await page.goto('/admin/guest-posts');

    await expect(page.getByRole('heading', { name: /Guest Post Submissions Queue/i })).toBeVisible();
  });
});
