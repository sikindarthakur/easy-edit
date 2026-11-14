import { PDFDocument } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';

export const fromImageProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    if (!ctx.files || ctx.files.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    ctx.onProgress(10, 'Creating PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pdfDoc = await PDFDocument.create();
    const totalFiles = ctx.files.length;
    let totalInputBytes = 0;

    const pageSizeOpt = (ctx.options.pageSize as string) || 'fit';
    const orientationOpt = (ctx.options.orientation as string) || 'portrait';
    const marginOpt = (ctx.options.margin as string) || 'none';

    let marginPt = 0;
    if (marginOpt === 'small') marginPt = 28.35; // ~10mm
    else if (marginOpt === 'big') marginPt = 56.7; // ~20mm

    for (let i = 0; i < totalFiles; i++) {
      const file = ctx.files[i];
      if (!file) continue;

      totalInputBytes += file.size;
      const progress = 15 + Math.round((i / totalFiles) * 75);
      ctx.onProgress(progress, `Processing ${file.name} (${i + 1}/${totalFiles})…`);

      if (ctx.signal.aborted) throw new Error('Cancelled');

      let embeddedImage;
      const mime = file.type.toLowerCase();

      if (mime === 'image/jpeg' || mime === 'image/jpg') {
        const bytes = await file.arrayBuffer();
        embeddedImage = await pdfDoc.embedJpg(bytes);
      } else if (mime === 'image/png') {
        const bytes = await file.arrayBuffer();
        embeddedImage = await pdfDoc.embedPng(bytes);
      } else {
        // Fallback for WebP / others: convert to PNG via canvas/OffscreenCanvas
        const bitmap = await createImageBitmap(file);
        let pngBytes: ArrayBuffer;

        if (typeof OffscreenCanvas !== 'undefined') {
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const cCtx = canvas.getContext('2d');
          cCtx?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const blob = await canvas.convertToBlob({ type: 'image/png' });
          pngBytes = await blob.arrayBuffer();
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const cCtx = canvas.getContext('2d');
          cCtx?.drawImage(bitmap, 0, 0);
          bitmap.close();
          const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
          pngBytes = await blob.arrayBuffer();
        }

        embeddedImage = await pdfDoc.embedPng(pngBytes);
      }

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageWidth = imgWidth;
      let pageHeight = imgHeight;

      if (pageSizeOpt === 'a4') {
        pageWidth = 595.28;
        pageHeight = 841.89;
      } else if (pageSizeOpt === 'letter') {
        pageWidth = 612.0;
        pageHeight = 792.0;
      }

      // Check orientation
      const isLandscape =
        orientationOpt === 'landscape' ||
        (orientationOpt === 'auto' && imgWidth > imgHeight);

      if (pageSizeOpt !== 'fit' && isLandscape && pageWidth < pageHeight) {
        // Swap for landscape
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      if (pageSizeOpt === 'fit') {
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      } else {
        const availWidth = Math.max(1, pageWidth - marginPt * 2);
        const availHeight = Math.max(1, pageHeight - marginPt * 2);

        const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
        const renderWidth = imgWidth * scale;
        const renderHeight = imgHeight * scale;

        const xPos = marginPt + (availWidth - renderWidth) / 2;
        const yPos = marginPt + (availHeight - renderHeight) / 2;

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: renderWidth,
          height: renderHeight,
        });
      }
    }

    ctx.onProgress(92, 'Generating PDF…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pdfBytes = await pdfDoc.save();
    const outputBlob = uint8ArrayToBlob(pdfBytes, 'application/pdf');
    const firstFileName = ctx.files[0]?.name || 'images.pdf';
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

export default fromImageProcessor;
