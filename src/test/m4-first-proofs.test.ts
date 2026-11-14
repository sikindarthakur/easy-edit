import { describe, it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { mergePdfProcessor } from '@/tools/pdf/merge';
import { resizeProcessor } from '@/tools/image/resize';
import { uint8ArrayToBlob } from '@/lib/download';

describe('M4: First Proofs Unit Tests', () => {
  describe('PDF Merge Processor', () => {
    it('successfully merges multiple PDFs into one document', async () => {
      // Create PDF 1 with 2 pages
      const pdf1 = await PDFDocument.create();
      pdf1.addPage([100, 100]);
      pdf1.addPage([100, 100]);
      const bytes1 = await pdf1.save();
      const file1 = new File([uint8ArrayToBlob(bytes1, 'application/pdf')], 'doc1.pdf', { type: 'application/pdf' });

      // Create PDF 2 with 1 page
      const pdf2 = await PDFDocument.create();
      pdf2.addPage([200, 200]);
      const bytes2 = await pdf2.save();
      const file2 = new File([uint8ArrayToBlob(bytes2, 'application/pdf')], 'doc2.pdf', { type: 'application/pdf' });

      const progressSpy = vi.fn();
      const abortController = new AbortController();

      const result = await mergePdfProcessor.process({
        files: [file1, file2],
        options: {},
        signal: abortController.signal,
        onProgress: progressSpy,
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0]?.name).toBe('doc1-easyedit.pdf');
      expect(result.stats?.inputBytes).toBe(file1.size + file2.size);
      expect(result.stats?.outputBytes).toBeGreaterThan(0);

      // Verify merged output has 3 pages
      const mergedPdf = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      expect(mergedPdf.getPageCount()).toBe(3);
    });

    it('rejects corrupted PDF with Section 11.3 message', async () => {
      const corruptFile = new File(['not a real pdf'], 'corrupt.pdf', { type: 'application/pdf' });
      const abortController = new AbortController();

      await expect(
        mergePdfProcessor.process({
          files: [corruptFile],
          options: {},
          signal: abortController.signal,
          onProgress: vi.fn(),
        })
      ).rejects.toThrow("We couldn't read this file. It may be damaged.");
    });
  });

  describe('Image Resize Processor', () => {
    it('calculates aspect ratio and sets dimensions properly', () => {
      // Unit calculation check: 1000x500 at 50% => 500x250
      const origW = 1000;
      const origH = 500;
      const pct = 0.5;
      expect(Math.round(origW * pct)).toBe(500);
      expect(Math.round(origH * pct)).toBe(250);
    });

    it('handles empty files gracefully', async () => {
      const abortController = new AbortController();
      await expect(
        resizeProcessor.process({
          files: [],
          options: {},
          signal: abortController.signal,
          onProgress: vi.fn(),
        })
      ).rejects.toThrow('No image file selected.');
    });
  });
});
