import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename } from '@/lib/download';

export const resizeProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) {
      throw new Error('No image file selected.');
    }

    ctx.onProgress(15, 'Loading image…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    // Load image into an HTMLImageElement or ImageBitmap
    const imageBitmap = await createImageBitmap(file);
    const origWidth = imageBitmap.width;
    const origHeight = imageBitmap.height;

    ctx.onProgress(35, 'Calculating target dimensions…');
    if (ctx.signal.aborted) {
      imageBitmap.close();
      throw new Error('Cancelled');
    }

    const mode = (ctx.options.mode as string) || 'pixels';
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (mode === 'percent') {
      const pct = (Number(ctx.options.percent) || 50) / 100;
      targetWidth = Math.max(1, Math.round(origWidth * pct));
      targetHeight = Math.max(1, Math.round(origHeight * pct));
    } else if (mode === 'preset') {
      const presetStr = (ctx.options.preset as string) || '1920x1080';
      const parts = presetStr.split('x');
      const pW = parts[0] ? parseInt(parts[0], 10) : 1920;
      const pH = parts[1] ? parseInt(parts[1], 10) : 1080;
      targetWidth = pW;
      targetHeight = pH;
    } else {
      // By pixels
      const userW = Number(ctx.options.width) || origWidth;
      const userH = Number(ctx.options.height) || origHeight;
      const lockAspect = Boolean(ctx.options.lockAspect !== false);

      if (lockAspect) {
        const aspect = origWidth / origHeight;
        if (userW !== origWidth) {
          targetWidth = userW;
          targetHeight = Math.max(1, Math.round(userW / aspect));
        } else {
          targetHeight = userH;
          targetWidth = Math.max(1, Math.round(userH * aspect));
        }
      } else {
        targetWidth = userW;
        targetHeight = userH;
      }
    }

    ctx.onProgress(55, `Rendering to ${targetWidth}×${targetHeight}…`);
    if (ctx.signal.aborted) {
      imageBitmap.close();
      throw new Error('Cancelled');
    }

    // Render using OffscreenCanvas if available, otherwise document.createElement('canvas')
    let outputBlob: Blob;
    const formatOption = (ctx.options.format as string) || 'keep';
    const qualityNum = (Number(ctx.options.quality) || 90) / 100;

    let mimeType = file.type || 'image/jpeg';
    if (formatOption !== 'keep') {
      mimeType = formatOption;
    }

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const cCtx = canvas.getContext('2d');
      if (!cCtx) throw new Error('Canvas context could not be created.');

      cCtx.imageSmoothingEnabled = true;
      cCtx.imageSmoothingQuality = 'high';
      cCtx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
      imageBitmap.close();

      ctx.onProgress(85, 'Encoding output file…');
      outputBlob = await canvas.convertToBlob({ type: mimeType, quality: qualityNum });
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const cCtx = canvas.getContext('2d');
      if (!cCtx) throw new Error('Canvas context could not be created.');

      cCtx.imageSmoothingEnabled = true;
      cCtx.imageSmoothingQuality = 'high';
      cCtx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
      imageBitmap.close();

      ctx.onProgress(85, 'Encoding output file…');
      outputBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas encoding failed.'));
          },
          mimeType,
          qualityNum
        );
      });
    }

    ctx.onProgress(100, 'Complete');

    // Extension determination
    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const outputName = getEasyEditFilename(file.name, ext);
    const previewUrl = URL.createObjectURL(outputBlob);

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
          previewUrl,
        },
      ],
      stats: {
        inputBytes: file.size,
        outputBytes: outputBlob.size,
      },
    };
  },
};

export default resizeProcessor;
