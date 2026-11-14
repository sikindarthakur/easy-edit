import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { ToolProcessor, ProcessingContext, ToolResult, OutputFile } from '../types';
import { t } from '@/i18n';

// Set worker source for pdfjs-dist
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export const toImageProcessor: ToolProcessor = {
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

    let pdfDoc: pdfjsLib.PDFDocumentProxy;
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        // Disable external fonts fetching for strict privacy
        disableFontFace: false,
      });
      pdfDoc = await loadingTask.promise;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Password') || msg.includes('password')) {
        throw new Error(t('errors.passwordProtectedPdf'));
      }
      throw new Error(t('errors.corruptedFile'));
    }

    const numPages = pdfDoc.numPages;
    if (numPages === 0) throw new Error('PDF has no pages.');

    const formatOpt = (ctx.options.format as string) || 'jpeg';
    const mimeType = formatOpt === 'png' ? 'image/png' : 'image/jpeg';
    const ext = formatOpt === 'png' ? 'png' : 'jpg';

    const dpi = Number(ctx.options.dpi) || 150;
    const scale = dpi / 72;

    const outputFiles: OutputFile[] = [];
    let totalOutputBytes = 0;
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      if (ctx.signal.aborted) throw new Error('Cancelled');

      const progress = 15 + Math.round((pageNum / numPages) * 75);
      ctx.onProgress(progress, `Rendering page ${pageNum} of ${numPages}…`);

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) throw new Error('Canvas context could not be created.');

      // In PDF.js 4.x, renderParameters is { canvasContext, viewport }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const renderTask = (page as any).render({
        canvasContext,
        viewport,
      });

      await renderTask.promise;

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas rendering failed.'));
          },
          mimeType,
          0.92
        );
      });

      totalOutputBytes += blob.size;
      const previewUrl = pageNum === 1 ? URL.createObjectURL(blob) : undefined;

      outputFiles.push({
        name: `${baseName}-page-${pageNum}-easyedit.${ext}`,
        blob,
        previewUrl,
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

export default toImageProcessor;
