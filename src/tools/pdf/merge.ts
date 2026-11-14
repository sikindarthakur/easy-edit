import { PDFDocument } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

export const mergePdfProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    if (!ctx.files || ctx.files.length === 0) {
      throw new Error('Please select at least one PDF file.');
    }

    ctx.onProgress(10, 'Creating merged document…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const mergedPdf = await PDFDocument.create();
    const totalFiles = ctx.files.length;
    let totalInputBytes = 0;

    for (let i = 0; i < totalFiles; i++) {
      const file = ctx.files[i];
      if (!file) continue;

      totalInputBytes += file.size;

      const progressStart = 15 + Math.round((i / totalFiles) * 70);
      ctx.onProgress(progressStart, `Reading ${file.name} (${i + 1}/${totalFiles})…`);

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
        const errorMsg = err instanceof Error ? err.message : '';
        if (errorMsg.includes('encrypted') || errorMsg.includes('password') || errorMsg.includes('Password')) {
          throw new Error(t('errors.passwordProtectedPdf'));
        }
        throw new Error(t('errors.corruptedFile'));
      }

      const pageCount = sourcePdf.getPageCount();
      const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);

      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    ctx.onProgress(90, 'Saving merged PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const mergedBytes = await mergedPdf.save();
    const outputBlob = uint8ArrayToBlob(mergedBytes, 'application/pdf');

    const firstFileName = ctx.files[0]?.name || 'merged.pdf';
    const outputName = getEasyEditFilename(firstFileName, 'pdf');

    ctx.onProgress(100, 'Complete');

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
        },
      ],
      stats: {
        inputBytes: totalInputBytes,
        outputBytes: outputBlob.size,
      },
    };
  },
};

export default mergePdfProcessor;
