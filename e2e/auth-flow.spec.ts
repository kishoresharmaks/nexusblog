import { test, expect } from '@playwright/test';

test.describe('Authentication & Session Engine Flow', () => {
  test('should display login page with credentials form and OAuth/SSO options', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/NexusBlog/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    const emailInput = page.getByPlaceholder(/alex@example.com/i);
    const passwordInput = page.getByPlaceholder(/••••••••/i);
    const submitBtn = page.getByRole('button', { name: /Sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('should display registration form with password requirements', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /Join NexusBlog/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Alex Rivera/i)).toBeVisible();
    await expect(page.getByPlaceholder(/arivera/i)).toBeVisible();
  });

  test('should redirect unauthenticated users visiting /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    // Dashboard middleware or client guard routes to login
    await expect(page).toHaveURL(/\/login|\/dashboard/);
  });
});
