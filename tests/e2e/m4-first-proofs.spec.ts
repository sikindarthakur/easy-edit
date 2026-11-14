import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

test.describe('M4 First Proofs: Merge PDF and Resize Image', () => {
  test('Merge PDF: merges real PDF files and verifies zero network upload', async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE CONSOLE:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err));

    // Zero-upload network assertion
    const requestsWithBody: string[] = [];
    page.on('request', (req) => {
      const postData = req.postData();
      if (postData && postData.length > 0) {
        requestsWithBody.push(`${req.method()} ${req.url()}`);
      }
    });

    await page.goto('/pdf/merge');

    // Create 2 minimal real PDFs
    const pdfDoc1 = await PDFDocument.create();
    pdfDoc1.addPage([200, 200]);
    const pdfBytes1 = await pdfDoc1.save();

    const pdfDoc2 = await PDFDocument.create();
    pdfDoc2.addPage([300, 300]);
    const pdfBytes2 = await pdfDoc2.save();

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'invoice1.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdfBytes1) },
      { name: 'invoice2.pdf', mimeType: 'application/pdf', buffer: Buffer.from(pdfBytes2) },
    ]);

    await expect(page.getByText('invoice1.pdf')).toBeVisible();
    await expect(page.getByText('invoice2.pdf')).toBeVisible();

    const mergeBtn = page.getByRole('button', { name: 'Merge PDFs', exact: true });
    await expect(mergeBtn).toBeEnabled();
    await mergeBtn.click();

    // Verify result
    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('invoice1-easyedit.pdf')).toBeVisible();
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();

    // Assert zero file bytes sent across the network
    expect(requestsWithBody).toEqual([]);
  });

  test('Resize Image: resizes a PNG image', async ({ page }) => {
    await page.goto('/image/resize');

    // 1x1 transparent PNG buffer
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'photo.png', mimeType: 'image/png', buffer: pngBuffer },
    ]);

    await expect(page.getByText('photo.png')).toBeVisible();

    const resizeBtn = page.getByRole('button', { name: 'Resize image', exact: true });
    await expect(resizeBtn).toBeEnabled();
    await resizeBtn.click();

    // Verify result
    await expect(page.getByText('Done! Your file is ready.')).toBeVisible();
    await expect(page.getByText('photo-easyedit.png')).toBeVisible();
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });
});
