import { test, expect } from '@playwright/test';

test.describe('Home Page and Platform Basics', () => {
  test('loads home page with hero and exact copy', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/EasyEdit/);

    // Check exact hero copy
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Every file tool you need. Free.');
    await expect(page.getByText('Merge, compress, convert and edit files in seconds. No sign-up. Your files never leave your device.')).toBeVisible();

    // Check privacy badge
    await expect(page.getByText('🔒 Runs on your device. Your file is never uploaded.').first()).toBeVisible();

    // Check footer copy
    await expect(page.getByText('Free to use. Built to respect your privacy.')).toBeVisible();
  });

  test('toggles light and dark theme', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeBtn = page.getByRole('button', { name: /mode/i });

    // Click theme toggle
    await themeBtn.click();
    const hasDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Click again to toggle back
    await themeBtn.click();
    const hasDarkAfter = await html.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkAfter).not.toBe(hasDark);
  });

  test('opens search modal with shortcut and searches tools', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click search trigger in header
    const searchTrigger = page.getByRole('button', { name: 'Open search dialog' });
    await searchTrigger.click();

    const searchInput = page.getByRole('textbox', { name: 'Search tools' });
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('merge');
    await expect(page.getByText('Merge PDF').first()).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(searchInput).not.toBeVisible();
  });

  test('navigates to All Tools directory', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'All Tools' }).click();
    await expect(page).toHaveURL('/tools');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('All Tools');
  });

  test('navigates to privacy & how we handle files pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'How we handle files' }).click();
    await expect(page).toHaveURL('/how-we-handle-files');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('How We Handle Your Files');
  });
});
