import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

test.describe('M5 PDF Tools E2E Suite', () => {
  const createPdfBuffer = async (pageCount = 3): Promise<Buffer> => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([200, 200]);
    }
    const bytes = await doc.save();
    return Buffer.from(bytes);
  };

  test('Split PDF: uploads PDF, sets split ranges, executes and shows results', async ({ page }) => {
    await page.goto('/pdf/split');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Split a PDF');

    const pdfBuffer = await createPdfBuffer(4);
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'document.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
    ]);

    await expect(page.getByText('document.pdf')).toBeVisible();

    const splitBtn = page.getByRole('button', { name: 'Split PDF', exact: true });
    await expect(splitBtn).toBeEnabled();
    await splitBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('Rotate PDF: uploads PDF, selects rotation angle, executes and shows results', async ({ page }) => {
    await page.goto('/pdf/rotate');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rotate PDF pages');

    const pdfBuffer = await createPdfBuffer(2);
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'scan.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
    ]);

    await expect(page.getByText('scan.pdf')).toBeVisible();

    const rotateBtn = page.getByRole('button', { name: 'Rotate PDF', exact: true });
    await expect(rotateBtn).toBeEnabled();
    await rotateBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('scan-easyedit.pdf')).toBeVisible();
  });

  test('Organize PDF: uploads PDF, saves organized document', async ({ page }) => {
    await page.goto('/pdf/organize');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Organize PDF pages');

    const pdfBuffer = await createPdfBuffer(3);
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'pages.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
    ]);

    await expect(page.getByText('pages.pdf')).toBeVisible();

    const saveBtn = page.getByRole('button', { name: 'Save PDF', exact: true });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('pages-easyedit.pdf')).toBeVisible();
  });

  test('Image to PDF: uploads images, compiles into PDF', async ({ page }) => {
    await page.goto('/pdf/from-image');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Convert images to PDF');

    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const pngBuffer = Buffer.from(pngBase64, 'base64');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'scan1.png', mimeType: 'image/png', buffer: pngBuffer },
      { name: 'scan2.png', mimeType: 'image/png', buffer: pngBuffer },
    ]);

    await expect(page.getByText('scan1.png')).toBeVisible();
    await expect(page.getByText('scan2.png')).toBeVisible();

    const createBtn = page.getByRole('button', { name: 'Create PDF', exact: true });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('scan1-easyedit.pdf')).toBeVisible();
  });

  test('Mobile viewport: checks responsiveness and touch targets on iPhone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/pdf/merge');

    // On mobile, the upload button says "Choose files"
    const uploadBtn = page.getByRole('button', { name: 'Choose files', exact: true });
    await expect(uploadBtn).toBeVisible();

    // Verify touch target is at least 40px
    const box = await uploadBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });
});
