import { PDFDocument } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult, OutputFile } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

// Helper to parse page range strings e.g. "1-3, 5, 8-10"
export function parsePageRanges(rangeStr: string, maxPages: number): number[][] {
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);
  const groups: number[][] = [];

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr || '1', 10);
      const end = parseInt(endStr || String(maxPages), 10);
      if (!isNaN(start) && !isNaN(end)) {
        const minP = Math.max(1, Math.min(start, end));
        const maxP = Math.min(maxPages, Math.max(start, end));
        const group: number[] = [];
        for (let p = minP; p <= maxP; p++) {
          group.push(p - 1); // 0-based index
        }
        if (group.length > 0) groups.push(group);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        groups.push([pageNum - 1]);
      }
    }
  }

  return groups;
}

export const splitPdfProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) throw new Error('Please select a PDF file.');

    ctx.onProgress(10, 'Loading PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch {
      throw new Error(t('errors.corruptedFile'));
    }

    let sourcePdf: PDFDocument;
    try {
      sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('encrypted') || msg.includes('password')) {
        throw new Error(t('errors.passwordProtectedPdf'));
      }
      throw new Error(t('errors.corruptedFile'));
    }

    const totalPages = sourcePdf.getPageCount();
    if (totalPages === 0) {
      throw new Error('This PDF has no pages.');
    }

    const mode = (ctx.options.mode as string) || 'range';
    let pageGroups: number[][] = [];

    if (mode === 'every') {
      const everyN = Math.max(1, Number(ctx.options.everyN) || 1);
      for (let i = 0; i < totalPages; i += everyN) {
        const group: number[] = [];
        for (let j = i; j < Math.min(i + everyN, totalPages); j++) {
          group.push(j);
        }
        pageGroups.push(group);
      }
    } else if (mode === 'all') {
      for (let i = 0; i < totalPages; i++) {
        pageGroups.push([i]);
      }
    } else {
      // By range
      const rangeStr = (ctx.options.ranges as string) || `1-${totalPages}`;
      pageGroups = parsePageRanges(rangeStr, totalPages);
      if (pageGroups.length === 0) {
        // Fallback to all
        pageGroups = [[0]];
      }
    }

    const outputFiles: OutputFile[] = [];
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    let totalOutputBytes = 0;

    for (let i = 0; i < pageGroups.length; i++) {
      if (ctx.signal.aborted) throw new Error('Cancelled');
      const group = pageGroups[i];
      if (!group || group.length === 0) continue;

      const progress = 20 + Math.round((i / pageGroups.length) * 70);
      ctx.onProgress(progress, `Extracting split document ${i + 1} of ${pageGroups.length}…`);

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(sourcePdf, group);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }

      const pdfBytes = await newPdf.save();
      const blob = uint8ArrayToBlob(pdfBytes, 'application/pdf');
      totalOutputBytes += blob.size;

      const splitName =
        pageGroups.length === 1
          ? getEasyEditFilename(file.name, 'pdf')
          : `${baseName}-part${i + 1}-easyedit.pdf`;

      outputFiles.push({
        name: splitName,
        blob,
      });
    }

    ctx.onProgress(100, 'Complete');

    return {
      files: outputFiles,
      stats: {
        inputBytes: file.size,
        outputBytes: totalOutputBytes,
      },
    };
  },
};

export default splitPdfProcessor;
