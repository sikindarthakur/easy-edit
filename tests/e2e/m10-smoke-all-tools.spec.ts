import { test, expect } from '@playwright/test';
import { toolsRegistry } from '@/tools/registry';

test.describe('M10 Comprehensive Smoke Test Across All Tools', () => {
  for (const tool of toolsRegistry) {
    test(`Smoke test: ${tool.name} (${tool.route})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      const response = await page.goto(tool.route);
      expect(response?.status()).toBe(200);

      // Verify privacy badge in main workspace
      await expect(
        page.getByRole('main').getByText('Runs on your device. Your file is never uploaded.')
      ).toBeVisible();

      // Verify page H1 title in header
      await expect(
        page.locator('header').getByRole('heading', { level: 1 })
      ).toHaveText(tool.title);

      // Verify description
      await expect(page.getByText(tool.description)).toBeVisible();

      // Verify how-to section
      await expect(
        page.getByRole('heading', { name: `How to ${tool.name}` })
      ).toBeVisible();

      // Verify FAQ section
      await expect(
        page.getByRole('heading', { name: 'Frequently Asked Questions' })
      ).toBeVisible();

      // Verify Related Tools section
      await expect(
        page.getByRole('heading', { name: 'Related Tools' })
      ).toBeVisible();

      // Verify zero console errors
      expect(consoleErrors).toEqual([]);
    });
  }
});
