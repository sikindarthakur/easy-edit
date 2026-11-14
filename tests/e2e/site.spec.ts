import { test, expect } from '@playwright/test';

test.describe('M3 Site & Information Architecture', () => {
  test('category pages render tools for that category', async ({ page }) => {
    await page.goto('/pdf');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('PDF Tools');
    await expect(page.getByRole('heading', { name: 'Merge PDF' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Split PDF' })).toBeVisible();

    await page.goto('/image');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Image Tools');
    await expect(page.getByRole('heading', { name: 'Resize Image' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compress Image' })).toBeVisible();
  });

  test('All Tools directory supports search and category filtering', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('All Tools');

    // Filter by category tab
    await page.getByRole('button', { name: 'Developer' }).click();
    await expect(page.getByRole('heading', { name: 'JSON Formatter and Validator' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Merge PDF' })).not.toBeVisible();

    // Reset to All
    await page.getByRole('button', { name: 'All' }).click();
    await expect(page.getByRole('heading', { name: 'Merge PDF' })).toBeVisible();

    // Synonym search test: "shrink" should find "Compress Image" and "Compress PDF"
    const searchInput = page.getByRole('textbox', { name: 'Filter tools' });
    await searchInput.fill('shrink');
    await expect(page.getByRole('heading', { name: 'Compress Image' })).toBeVisible();
  });

  test('404 page renders with helpful back links', async ({ page }) => {
    await page.goto('/non-existent-page-12345');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page Not Found');
    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
  });

  test('legal pages load properly', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');

    await page.goto('/terms');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of Service');

    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('About EasyEdit');

    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact & Support');
  });
});
