import { describe, it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { splitPdfProcessor, parsePageRanges } from '@/tools/pdf/split';
import { rotatePdfProcessor } from '@/tools/pdf/rotate';
import { organizePdfProcessor } from '@/tools/pdf/organize';
import { fromImageProcessor } from '@/tools/pdf/fromImage';
import { uint8ArrayToBlob } from '@/lib/download';

describe('M5: PDF Tools Processors', () => {
  const createMockPdf = async (pageCount = 4): Promise<File> => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      doc.addPage([100 * (i + 1), 100 * (i + 1)]);
    }
    const bytes = await doc.save();
    return new File([uint8ArrayToBlob(bytes, 'application/pdf')], 'sample.pdf', {
      type: 'application/pdf',
    });
  };

  describe('Split PDF', () => {
    it('parses range strings into correct 0-based page groups', () => {
      expect(parsePageRanges('1-2, 4', 5)).toEqual([[0, 1], [3]]);
      expect(parsePageRanges('2-4', 5)).toEqual([[1, 2, 3]]);
      expect(parsePageRanges('1, 3, 5', 5)).toEqual([[0], [2], [4]]);
    });

    it('splits a 4-page PDF into specified ranges', async () => {
      const file = await createMockPdf(4);
      const abortController = new AbortController();

      const result = await splitPdfProcessor.process({
        files: [file],
        options: {
          mode: 'range',
          ranges: '1-2, 3-4',
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(2);
      expect(result.files[0]?.name).toContain('part1');
      expect(result.files[1]?.name).toContain('part2');

      // Verify page count in part 1
      const doc1 = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      expect(doc1.getPageCount()).toBe(2);

      // Verify page count in part 2
      const doc2 = await PDFDocument.load(await result.files[1]!.blob.arrayBuffer());
      expect(doc2.getPageCount()).toBe(2);
    });

    it('splits a PDF every N pages', async () => {
      const file = await createMockPdf(4);
      const abortController = new AbortController();

      const result = await splitPdfProcessor.process({
        files: [file],
        options: {
          mode: 'every',
          everyN: 2,
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(2);
    });
  });

  describe('Rotate PDF', () => {
    it('rotates all pages by 90 degrees', async () => {
      const file = await createMockPdf(2);
      const abortController = new AbortController();

      const result = await rotatePdfProcessor.process({
        files: [file],
        options: {
          angle: 90,
          scope: 'all',
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      const rotatedPdf = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      const pages = rotatedPdf.getPages();
      expect(pages[0]?.getRotation().angle).toBe(90);
      expect(pages[1]?.getRotation().angle).toBe(90);
    });

    it('rotates only odd pages by 180 degrees', async () => {
      const file = await createMockPdf(2);
      const abortController = new AbortController();

      const result = await rotatePdfProcessor.process({
        files: [file],
        options: {
          angle: 180,
          scope: 'odd',
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      const rotatedPdf = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      const pages = rotatedPdf.getPages();
      expect(pages[0]?.getRotation().angle).toBe(180); // Page 1 (odd)
      expect(pages[1]?.getRotation().angle).toBe(0);   // Page 2 (even)
    });
  });

  describe('Organize PDF', () => {
    it('reorders and duplicates pages according to pageOrder', async () => {
      const file = await createMockPdf(3);
      const abortController = new AbortController();

      // Reverse order and duplicate page 1: [2, 1, 0, 0]
      const result = await organizePdfProcessor.process({
        files: [file],
        options: {
          pageOrder: [2, 1, 0, 0],
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      const organizedPdf = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      expect(organizedPdf.getPageCount()).toBe(4);
    });
  });

  describe('Image to PDF', () => {
    it('converts images into a multi-page PDF', async () => {
      // 1x1 transparent PNG buffer
      const pngBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const pngBuffer = Buffer.from(pngBase64, 'base64');
      const imgFile = new File([pngBuffer], 'photo.png', { type: 'image/png' });

      const abortController = new AbortController();

      const result = await fromImageProcessor.process({
        files: [imgFile],
        options: {
          pageSize: 'a4',
          orientation: 'portrait',
          margin: 'small',
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      const doc = await PDFDocument.load(await result.files[0]!.blob.arrayBuffer());
      expect(doc.getPageCount()).toBe(1);
      const page = doc.getPages()[0];
      expect(page?.getWidth()).toBeCloseTo(595.28, 1);
      expect(page?.getHeight()).toBeCloseTo(841.89, 1);
    });
  });
});

