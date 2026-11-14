import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export const compressPdfProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) throw new Error('Please select a PDF file.');

    ctx.onProgress(10, 'Analyzing PDF document…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const inputBytes = file.size;
    const arrayBuffer = await file.arrayBuffer();

    const mode = (ctx.options.compressionMode as string) || 'light';
    let outputBlob: Blob;
    const notes: string[] = [];

    if (mode === 'strong') {
      ctx.onProgress(20, 'Applying strong compression (rebuilding pages as optimized images)…');
      notes.push(t('errors.strongPdfCompressionWarning'));

      let pdfDoc: pdfjsLib.PDFDocumentProxy;
      try {
        pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      } catch {
        throw new Error(t('errors.corruptedFile'));
      }

      const numPages = pdfDoc.numPages;
      const newPdf = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        if (ctx.signal.aborted) throw new Error('Cancelled');
        const progress = 20 + Math.round((i / numPages) * 65);
        ctx.onProgress(progress, `Compressing page ${i} of ${numPages}…`);

        const page = await pdfDoc.getPage(i);
        // Render at 120 DPI scale for strong compression
        const viewport = page.getViewport({ scale: 120 / 72 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const cCtx = canvas.getContext('2d');
        if (!cCtx) throw new Error('Canvas context error');

        // Clean white background
        cCtx.fillStyle = '#ffffff';
        cCtx.fillRect(0, 0, canvas.width, canvas.height);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const renderTask = (page as any).render({ canvasContext: cCtx, viewport });
        await renderTask.promise;

        const imgBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.65);
        });

        const imgBytes = await imgBlob.arrayBuffer();
        const embeddedImg = await newPdf.embedJpg(imgBytes);

        // Preserve original page dimensions in PDF points
        const origViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height,
        });
      }

      ctx.onProgress(90, 'Saving compressed PDF…');
      const savedBytes = await newPdf.save();
      outputBlob = uint8ArrayToBlob(savedBytes, 'application/pdf');
    } else {
      // Light mode: Lossless stream optimization and re-save
      ctx.onProgress(30, 'Performing lossless stream optimization…');
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

      ctx.onProgress(70, 'Optimizing object streams…');
      if (ctx.signal.aborted) throw new Error('Cancelled');

      const savedBytes = await pdfDoc.save({ useObjectStreams: true });
      outputBlob = uint8ArrayToBlob(savedBytes, 'application/pdf');
    }

    ctx.onProgress(100, 'Complete');

    // Check if compression yielded gains
    if (outputBlob.size >= inputBytes) {
      notes.push(t('errors.compressionNoGain'));
      // Return original file so user is not given a bloated file
      outputBlob = file;
    }

    const outputName = getEasyEditFilename(file.name, 'pdf');

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
        },
      ],
      stats: {
        inputBytes,
        outputBytes: outputBlob.size,
      },
      notes: notes.length > 0 ? notes : undefined,
    };
  },
};

export default compressPdfProcessor;

