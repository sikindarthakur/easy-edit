import { test, expect, Page } from '@playwright/test';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

async function runAxe(page: Page, pageName: string) {
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (window as any).axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });

  const violations = results.violations;
  if (violations.length > 0) {
    console.error(
      `Axe accessibility violations on ${pageName}:`,
      violations.map((v: { id: string; description: string; nodes: unknown[] }) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.length,
      }))
    );
  }
  expect(violations).toEqual([]);
}

test.describe('M9: Axe Accessibility Audits', () => {
  test('Home page passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/');
    await runAxe(page, 'Home');
  });

  test('All Tools page passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/tools');
    await runAxe(page, 'All Tools');
  });

  test('Category page passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/pdf');
    await runAxe(page, 'Category (PDF)');
  });

  test('Tool page (Resize Image) passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/image/resize');
    await runAxe(page, 'Tool Page (Resize Image)');
  });

  test('Text tool page (Word Counter) passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/document/word-counter');
    await runAxe(page, 'Text Tool Page (Word Counter)');
  });

  test('Legal page (Privacy Policy) passes WCAG 2.0/2.1 AA', async ({ page }) => {
    await page.goto('/privacy');
    await runAxe(page, 'Privacy Policy');
  });
});

