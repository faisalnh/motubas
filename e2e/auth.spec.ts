import { test, expect } from '@playwright/test';

test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h1')).toContainText('Masuk ke Motubas');
});

test('should show registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Daftar Akun Baru');
});

test('should show landing page', async ({ page }) => {
    await page.goto('/');
    // Landing page or redirect to login depending on project structure
    // Based on common next-auth setup
    await expect(page).toHaveTitle(/Motubas/);
});
