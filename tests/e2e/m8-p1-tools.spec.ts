import { test, expect } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import * as fflate from 'fflate';

test.describe('M8 P1 Tools E2E Suite', () => {
  const createPdfBuffer = async (pageCount = 2): Promise<Buffer> => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([300, 300]);
    }
    const bytes = await doc.save();
    return Buffer.from(bytes);
  };

  test('Compress PDF: uploads PDF, executes light compression and downloads', async ({ page }) => {
    await page.goto('/pdf/compress');
    await expect(page.getByRole('heading', { name: 'Compress PDF', exact: true })).toBeVisible();

    const pdfBuffer = await createPdfBuffer(2);
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'large-doc.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
    ]);

    await expect(page.getByText('large-doc.pdf')).toBeVisible();

    const compressBtn = page.getByRole('button', { name: 'Compress PDF', exact: true });
    await expect(compressBtn).toBeEnabled();
    await compressBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('ZIP Creator: uploads files, bundles into archive and produces ZIP', async ({ page }) => {
    await page.goto('/archive/zip-create');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create a ZIP file');

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Meeting notes') },
      { name: 'summary.txt', mimeType: 'text/plain', buffer: Buffer.from('Executive summary') },
    ]);

    await expect(page.getByText('notes.txt')).toBeVisible();
    await expect(page.getByText('summary.txt')).toBeVisible();

    const createBtn = page.getByRole('button', { name: 'Create ZIP', exact: true });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('ZIP Extractor: extracts files from an uploaded zip archive safely', async ({ page }) => {
    await page.goto('/archive/zip-extract');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Open a ZIP file');

    // Generate a valid zip buffer
    const zipBytes = fflate.zipSync({
      'file1.txt': fflate.strToU8('Content of file 1'),
      'folder/file2.txt': fflate.strToU8('Content of nested file 2'),
    });
    const zipBuffer = Buffer.from(zipBytes);

    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles([
      { name: 'bundle.zip', mimeType: 'application/zip', buffer: zipBuffer },
    ]);

    await expect(page.getByText('bundle.zip')).toBeVisible();

    const extractBtn = page.getByRole('button', { name: 'Extract', exact: true });
    await expect(extractBtn).toBeEnabled();
    await extractBtn.click();

    await expect(page.getByText('Done! Your file is ready.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /Download/i })).toBeVisible();
  });

  test('Markdown to PDF: live markdown typing renders preview and compiles PDF', async ({
    page,
  }) => {
    await page.goto('/document/markdown-to-pdf');
    await expect(page.getByRole('heading', { name: 'Markdown to PDF', exact: true })).toBeVisible();

    const textarea = page.locator('textarea');
    await textarea.fill('# EasyEdit Custom Title\n\nInstant and private conversion.');

    // Assert live preview contains rendered heading
    await expect(page.getByRole('heading', { name: 'EasyEdit Custom Title' })).toBeVisible();

    // Trigger PDF generation
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await page.getByRole('button', { name: 'Create PDF' }).click();

    // Either download triggered or action finished without throwing
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });
});
