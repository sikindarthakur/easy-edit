import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

test.describe('M2 Tool Page Shell & Dummy Runner', () => {
  const createPdfBuffer = async (pageCount = 1): Promise<Buffer> => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([200, 200]);
    }
    const bytes = await doc.save();
    return Buffer.from(bytes);
  };

  test('executes tool end-to-end: upload -> options -> run -> progress -> result -> reset', async ({
    page,
  }) => {
    await page.goto('/pdf/merge');

    // Verify H1 and description
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merge PDF files');
    await expect(
      page.getByText('Combine several PDFs into one document, in the order you choose.')
    ).toBeVisible();

    // Verify Privacy badge
    await expect(
      page.getByText('🔒 Runs on your device. Your file is never uploaded.').first()
    ).toBeVisible();

    // Verify upload zone
    const uploadInput = page.locator('input[type="file"]').first();
    await expect(uploadInput).toBeAttached();

    // Create real valid PDF buffers using pdf-lib
    const pdf1 = await createPdfBuffer(1);
    const pdf2 = await createPdfBuffer(2);

    // Upload 2 PDF files
    await uploadInput.setInputFiles([
      { name: 'document1.pdf', mimeType: 'application/pdf', buffer: pdf1 },
      { name: 'document2.pdf', mimeType: 'application/pdf', buffer: pdf2 },
    ]);

    // Verify files appear in list
    await expect(page.getByText('document1.pdf')).toBeVisible();
    await expect(page.getByText('document2.pdf')).toBeVisible();

    // Check primary button is enabled
    const runButton = page.getByRole('button', { name: 'Merge PDFs', exact: true });
    await expect(runButton).toBeEnabled();

    // Click run
    await runButton.click();

    // Verify result appears
    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start over' })).toBeVisible();

    // Verify Start over resets
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByText('document1.pdf')).not.toBeVisible();
    await expect(page.getByText('Done! Your file is ready.')).not.toBeVisible();
  });
});
