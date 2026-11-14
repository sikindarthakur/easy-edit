import { describe, it, expect, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { zipSync } from 'fflate';
import { compressPdfProcessor } from '@/tools/pdf/compress';
import { zipCreateProcessor } from '@/tools/archive/zipCreate';
import { zipExtractProcessor } from '@/tools/archive/zipExtract';
import { renderMarkdownSafe, markdownToPdfProcessor } from '@/tools/document/markdownToPdf';
import { uint8ArrayToBlob } from '@/lib/download';

describe('M8: P1 Tools Processors', () => {
  describe('Compress PDF', () => {
    it('performs lossless stream compression and returns PDF', async () => {
      const doc = await PDFDocument.create();
      doc.addPage([200, 200]);
      const bytes = await doc.save();
      const file = new File([uint8ArrayToBlob(bytes, 'application/pdf')], 'input.pdf', {
        type: 'application/pdf',
      });

      const abortController = new AbortController();

      const result = await compressPdfProcessor.process({
        files: [file],
        options: { compressionMode: 'light' },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0]?.name).toBe('input-easyedit.pdf');
    });
  });

  describe('ZIP Creator', () => {
    it('bundles multiple files into a valid ZIP archive', async () => {
      const file1 = new File(['Hello world'], 'hello.txt', { type: 'text/plain' });
      const file2 = new File(['EasyEdit notes'], 'notes.txt', { type: 'text/plain' });

      const abortController = new AbortController();

      const result = await zipCreateProcessor.process({
        files: [file1, file2],
        options: {
          zipName: 'bundle.zip',
          compressionLevel: '6',
        },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0]?.name).toBe('bundle.zip');
      expect(result.files[0]!.blob.type).toBe('application/zip');
    });
  });

  describe('ZIP Extractor & Security Hardening', () => {
    it('extracts safe archive files', async () => {
      const zipData = {
        'test.txt': new TextEncoder().encode('Extracted contents'),
      };
      const zippedBytes = zipSync(zipData);
      const zipFile = new File([uint8ArrayToBlob(zippedBytes, 'application/zip')], 'test.zip', {
        type: 'application/zip',
      });

      const abortController = new AbortController();

      const result = await zipExtractProcessor.process({
        files: [zipFile],
        options: {},
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0]?.name).toBe('test.txt');
    });

    it('rejects path traversal attempts (Section 12 security gate)', async () => {
      const maliciousZip = {
        '../../evil.sh': new TextEncoder().encode('rm -rf /'),
      };
      const zippedBytes = zipSync(maliciousZip);
      const zipFile = new File([uint8ArrayToBlob(zippedBytes, 'application/zip')], 'malicious.zip', {
        type: 'application/zip',
      });

      const abortController = new AbortController();

      await expect(
        zipExtractProcessor.process({
          files: [zipFile],
          options: {},
          signal: abortController.signal,
          onProgress: vi.fn(),
        })
      ).rejects.toThrow('This archive contains unsafe paths or is unusually large, so we stopped.');
    });
  });

  describe('Markdown to PDF & DOMPurify', () => {
    it('sanitizes malicious script tags via DOMPurify', () => {
      const unsafeMarkdown = '# Title\n\n<script>alert("xss")</script>\n[Click me](javascript:evil)';
      const { sanitized } = renderMarkdownSafe(unsafeMarkdown);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('javascript:');
    });

    it('compiles clean Markdown to PDF', async () => {
      const mdContent = '# EasyEdit Report\n\nThis is a private document.';
      const file = new File([mdContent], 'report.md', { type: 'text/markdown' });

      const abortController = new AbortController();

      const result = await markdownToPdfProcessor.process({
        files: [file],
        options: { pageSize: 'a4', theme: 'clean' },
        signal: abortController.signal,
        onProgress: vi.fn(),
      });

      expect(result.files.length).toBe(1);
      expect(result.files[0]?.name).toBe('report-easyedit.pdf');
    });
  });
});

