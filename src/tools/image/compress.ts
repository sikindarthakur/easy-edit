import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename } from '@/lib/download';

export const compressImageProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) throw new Error('Please select an image file.');

    ctx.onProgress(15, 'Loading image…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;

    // Determine target format: actual (original), jpg, or png
    const formatOpt = (ctx.options.outputFormat as string) || 'original';
    const originalType = (file.type || '').toLowerCase();
    const originalName = (file.name || '').toLowerCase();

    const isPng = originalType === 'image/png' || originalName.endsWith('.png');
    const isJpeg =
      originalType === 'image/jpeg' ||
      originalType === 'image/jpg' ||
      originalName.endsWith('.jpg') ||
      originalName.endsWith('.jpeg');

    let mime: string;
    let ext: string;

    if (formatOpt === 'image/jpeg' || formatOpt === 'jpg') {
      mime = 'image/jpeg';
      ext = 'jpg';
    } else if (formatOpt === 'image/png' || formatOpt === 'png') {
      mime = 'image/png';
      ext = 'png';
    } else {
      // 'original': preserve actual format (never default to webp)
      if (isPng) {
        mime = 'image/png';
        ext = 'png';
      } else if (isJpeg) {
        mime = 'image/jpeg';
        ext = 'jpg';
      } else if (originalType.startsWith('image/')) {
        mime = originalType;
        ext = originalName.split('.').pop() || 'jpg';
      } else {
        mime = 'image/jpeg';
        ext = 'jpg';
      }
    }

    // Helper to render and compress at specific quality and scale
    const renderAtQuality = async (q: number, scale = 1.0): Promise<Blob> => {
      const renderW = Math.max(1, Math.round(width * scale));
      const renderH = Math.max(1, Math.round(height * scale));

      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(renderW, renderH);
        const cCtx = canvas.getContext('2d');
        if (!cCtx) throw new Error('Context error');
        // Clean white background for transparency handling if JPEG
        if (mime === 'image/jpeg') {
          cCtx.fillStyle = '#ffffff';
          cCtx.fillRect(0, 0, renderW, renderH);
        }
        cCtx.drawImage(bitmap, 0, 0, renderW, renderH);
        return await canvas.convertToBlob({ type: mime, quality: q });
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = renderW;
        canvas.height = renderH;
        const cCtx = canvas.getContext('2d');
        if (!cCtx) throw new Error('Context error');
        if (mime === 'image/jpeg') {
          cCtx.fillStyle = '#ffffff';
          cCtx.fillRect(0, 0, renderW, renderH);
        }
        cCtx.drawImage(bitmap, 0, 0, renderW, renderH);
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Compression error'))),
            mime,
            q
          );
        });
      }
    };

    const targetKb = Number(ctx.options.targetKb) || 0;
    let finalBlob: Blob;

    if (targetKb > 0) {
      // Binary search for target KB
      const targetBytes = targetKb * 1024;
      ctx.onProgress(30, `Optimizing to reach under ${targetKb} KB…`);

      let minQ = 0.1;
      let maxQ = 0.95;
      let bestBlob = await renderAtQuality(minQ, 1.0);

      if (mime === 'image/png' && bestBlob.size > targetBytes) {
        // For lossless PNG, scale dimensions to reach target byte size
        let minScale = 0.1;
        let maxScale = 1.0;
        for (let iter = 0; iter < 5; iter++) {
          if (ctx.signal.aborted) {
            bitmap.close();
            throw new Error('Cancelled');
          }
          const midScale = (minScale + maxScale) / 2;
          ctx.onProgress(40 + iter * 10, `Optimizing PNG size (${Math.round(midScale * 100)}%)…`);
          const testBlob = await renderAtQuality(1.0, midScale);
          if (testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            minScale = midScale;
          } else {
            maxScale = midScale;
          }
        }
        finalBlob = bestBlob;
      } else {
        for (let iter = 0; iter < 5; iter++) {
          if (ctx.signal.aborted) {
            bitmap.close();
            throw new Error('Cancelled');
          }

          const midQ = (minQ + maxQ) / 2;
          ctx.onProgress(40 + iter * 10, `Optimizing quality (${Math.round(midQ * 100)}%)…`);

          const testBlob = await renderAtQuality(midQ, 1.0);
          if (testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            minQ = midQ; // Try higher quality
          } else {
            maxQ = midQ; // Needs lower quality
          }
        }
        finalBlob = bestBlob;
      }
    } else {
      const qNum = (Number(ctx.options.quality) || 75) / 100;
      ctx.onProgress(60, `Compressing image at ${Math.round(qNum * 100)}% quality…`);
      const scale = mime === 'image/png' && qNum < 0.9 ? Math.max(0.4, Math.sqrt(qNum)) : 1.0;
      finalBlob = await renderAtQuality(qNum, scale);
    }

    bitmap.close();
    ctx.onProgress(100, 'Complete');

    const outputName = getEasyEditFilename(file.name, ext);
    const previewUrl = URL.createObjectURL(finalBlob);

    return {
      files: [
        {
          name: outputName,
          blob: finalBlob,
          previewUrl,
        },
      ],
      stats: {
        inputBytes: file.size,
        outputBytes: finalBlob.size,
      },
    };
  },
};

export default compressImageProcessor;
