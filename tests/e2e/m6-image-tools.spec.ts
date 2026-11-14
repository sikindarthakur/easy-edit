import { test, expect } from '@playwright/test';

test.describe('M6 Image Tools E2E Suite', () => {
  // 1x1 transparent PNG buffer
  const samplePngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const samplePngBuffer = Buffer.from(samplePngBase64, 'base64');

  test('Compress Image: uploads PNG, compresses in actual PNG format (not WebP)', async ({
    page,
  }) => {
    await page.goto('/image/compress');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compress image');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'photo.png', mimeType: 'image/png', buffer: samplePngBuffer },
    ]);

    await expect(page.getByText('photo.png')).toBeVisible();

    const compressBtn = page.getByRole('button', { name: 'Compress image', exact: true });
    await expect(compressBtn).toBeEnabled();
    await compressBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    // Verify output preserves PNG format instead of converting to webp
    await expect(page.getByText('photo-easyedit.png')).toBeVisible();
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('Compress Image: allows selecting JPG output format', async ({ page }) => {
    await page.goto('/image/compress');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'graphic.png', mimeType: 'image/png', buffer: samplePngBuffer },
    ]);

    await expect(page.getByText('graphic.png')).toBeVisible();

    // Select JPG format from output format dropdown
    await page.getByLabel('Output Format').selectOption('image/jpeg');

    const compressBtn = page.getByRole('button', { name: 'Compress image', exact: true });
    await expect(compressBtn).toBeEnabled();
    await compressBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    // Verify output is in JPG format
    await expect(page.getByText('graphic-easyedit.jpg')).toBeVisible();
  });

  test('Convert Image: batch converts PNG files to WebP', async ({ page }) => {
    await page.goto('/image/convert');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Convert image');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'img1.png', mimeType: 'image/png', buffer: samplePngBuffer },
      { name: 'img2.png', mimeType: 'image/png', buffer: samplePngBuffer },
    ]);

    await expect(page.getByText('img1.png')).toBeVisible();
    await expect(page.getByText('img2.png')).toBeVisible();

    // Select WebP as target format
    await page.getByLabel('Convert To').selectOption('image/webp');

    const convertBtn = page.getByRole('button', { name: 'Convert image', exact: true });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('img1-easyedit.webp')).toBeVisible();
    await expect(page.getByText('img2-easyedit.webp')).toBeVisible();
    await expect(page.getByRole('button', { name: /Download ZIP/i })).toBeVisible();
  });
});
