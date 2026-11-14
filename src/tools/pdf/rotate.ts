import { PDFDocument, degrees } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

export const rotatePdfProcessor: ToolProcessor = {
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

    let pdfDoc: PDFDocument;
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('encrypted') || msg.includes('password')) {
        throw new Error(t('errors.passwordProtectedPdf'));
      }
      throw new Error(t('errors.corruptedFile'));
    }

    const angle = Number(ctx.options.angle) || 90;
    const scope = (ctx.options.scope as string) || 'all';

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
      if (ctx.signal.aborted) throw new Error('Cancelled');
      const pageNum = i + 1; // 1-based

      const shouldRotate =
        scope === 'all' ||
        (scope === 'odd' && pageNum % 2 !== 0) ||
        (scope === 'even' && pageNum % 2 === 0);

      if (shouldRotate) {
        const page = pages[i];
        if (page) {
          const currentRotation = page.getRotation().angle;
          const newRotation = (currentRotation + angle) % 360;
          page.setRotation(degrees(newRotation));
        }
      }

      ctx.onProgress(15 + Math.round((i / totalPages) * 75), `Rotating page ${pageNum}…`);
    }

    ctx.onProgress(90, 'Saving rotated PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pdfBytes = await pdfDoc.save();
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

export default rotatePdfProcessor;
