import { test, expect } from '@playwright/test';

test.describe('M7 Text and Data Tools E2E Suite', () => {
  test('Word Counter: live typing updates stats', async ({ page }) => {
    await page.goto('/document/word-counter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Word counter');

    const textarea = page.locator('textarea');
    await textarea.fill('EasyEdit is free, private, and instant.');

    // Check stats are rendered live
    await expect(page.getByText('6').first()).toBeVisible(); // 6 words
    await expect(page.getByText('Words', { exact: true })).toBeVisible();
  });

  test('Case Converter: transforms text to UPPERCASE and Title Case', async ({ page }) => {
    await page.goto('/document/case-converter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Case converter');

    const textarea = page.locator('textarea');
    await textarea.fill('hello world from easyedit');

    // Click UPPERCASE
    await page.getByRole('button', { name: 'UPPERCASE' }).click();
    await expect(textarea).toHaveValue('HELLO WORLD FROM EASYEDIT');

    // Click Title Case
    await page.getByRole('button', { name: 'Title Case' }).click();
    await expect(textarea).toHaveValue('Hello World From Easyedit');
  });

  test('JSON Formatter: formats valid JSON and shows line/col syntax errors', async ({ page }) => {
    await page.goto('/developer/json-formatter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('JSON formatter and validator');

    const textarea = page.locator('textarea');
    await textarea.fill('{"b":2,"a":1}');

    // Format
    await page.getByRole('button', { name: 'Format JSON' }).click();
    const formattedVal = await textarea.inputValue();
    expect(formattedVal).toContain('{\n  "b": 2,\n  "a": 1\n}');

    // Test syntax error
    await textarea.fill('{"invalid": }');
    await expect(page.getByText(/Line \d+, column \d+:/)).toBeVisible();
  });

  test('Base64: encodes and decodes text', async ({ page }) => {
    await page.goto('/developer/base64');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Base64 encode and decode');

    const textarea = page.locator('textarea');
    await textarea.fill('Antigravity');

    await page.getByRole('button', { name: 'Encode to Base64' }).click();
    await expect(textarea).toHaveValue('QW50aWdyYXZpdHk=');

    // Switch to decode
    await page.getByLabel('Decode').check();
    await page.getByRole('button', { name: 'Decode from Base64' }).click();
    await expect(textarea).toHaveValue('Antigravity');
  });

  test('CSV ⇄ JSON: uploads CSV and converts to JSON', async ({ page }) => {
    await page.goto('/spreadsheet/csv-json');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('CSV and JSON converter');

    const csvContent = 'name,role\nAlice,Developer\nBob,Designer';
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'team.csv', mimeType: 'text/csv', buffer: Buffer.from(csvContent) },
    ]);

    await expect(page.getByText('team.csv')).toBeVisible();

    const convertBtn = page.getByRole('button', { name: 'Convert', exact: true });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('team-easyedit.json')).toBeVisible();
  });
});
