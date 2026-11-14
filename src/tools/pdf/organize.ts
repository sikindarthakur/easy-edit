import { PDFDocument, degrees } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

export const organizePdfProcessor: ToolProcessor = {
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
    if (totalPages === 0) throw new Error('PDF has no pages.');

    // Page order option: array of 0-based page numbers
    let order: number[] = [];
    if (Array.isArray(ctx.options.pageOrder) && ctx.options.pageOrder.length > 0) {
      order = (ctx.options.pageOrder as number[]).filter(
        (p) => typeof p === 'number' && p >= 0 && p < totalPages
      );
    } else {
      order = Array.from({ length: totalPages }, (_, i) => i);
    }

    if (order.length === 0) {
      throw new Error('At least one page must be included in the organized PDF.');
    }

    ctx.onProgress(30, 'Reorganizing pages…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, order);

    const rotations = (ctx.options.pageRotations as Record<number, number>) || {};

    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      if (page) {
        const extraRot = rotations[i] || 0;
        if (extraRot !== 0) {
          const currentRot = page.getRotation().angle;
          page.setRotation(degrees((currentRot + extraRot) % 360));
        }
        newPdf.addPage(page);
      }
    }

    ctx.onProgress(85, 'Saving organized PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pdfBytes = await newPdf.save();
    const outputBlob = uint8ArrayToBlob(pdfBytes, 'application/pdf');
    const outputName = getEasyEditFilename(file.name, 'pdf');

    ctx.onProgress(100, 'Complete');

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
        },
      ],
      stats: {
        inputBytes: file.size,
        outputBytes: outputBlob.size,
      },
    };
  },
};

export default organizePdfProcessor;
