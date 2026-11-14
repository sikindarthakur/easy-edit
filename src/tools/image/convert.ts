import { ToolProcessor, ProcessingContext, ToolResult, OutputFile } from '../types';
import { getEasyEditFilename } from '@/lib/download';

export const convertImageProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    if (!ctx.files || ctx.files.length === 0) {
      throw new Error('Please select at least one image file.');
    }

    const targetFormat = (ctx.options.targetFormat as string) || 'image/png';
    const qualityNum = (Number(ctx.options.quality) || 90) / 100;
    const isTargetJpg = targetFormat === 'image/jpeg' || targetFormat === 'image/jpg';

    let ext = 'png';
    if (isTargetJpg) ext = 'jpg';
    else if (targetFormat === 'image/webp') ext = 'webp';

    const outputFiles: OutputFile[] = [];
    let totalInputBytes = 0;
    let totalOutputBytes = 0;
    const totalFiles = ctx.files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = ctx.files[i];
      if (!file) continue;

      totalInputBytes += file.size;
      const progress = 10 + Math.round((i / totalFiles) * 80);
      ctx.onProgress(progress, `Converting ${file.name} to ${ext.toUpperCase()} (${i + 1}/${totalFiles})…`);

      if (ctx.signal.aborted) throw new Error('Cancelled');

      const bitmap = await createImageBitmap(file);
      const w = bitmap.width;
      const h = bitmap.height;

      let blob: Blob;

      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(w, h);
        const cCtx = canvas.getContext('2d');
        if (!cCtx) throw new Error('Canvas context error');

        if (isTargetJpg) {
          // Fill background white to handle transparency cleanly (Section 11.3)
          cCtx.fillStyle = '#ffffff';
          cCtx.fillRect(0, 0, w, h);
        }

        cCtx.drawImage(bitmap, 0, 0);
        bitmap.close();
        blob = await canvas.convertToBlob({ type: targetFormat, quality: qualityNum });
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const cCtx = canvas.getContext('2d');
        if (!cCtx) throw new Error('Canvas context error');

        if (isTargetJpg) {
          cCtx.fillStyle = '#ffffff';
          cCtx.fillRect(0, 0, w, h);
        }

        cCtx.drawImage(bitmap, 0, 0);
        bitmap.close();
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Conversion failed'))),
            targetFormat,
            qualityNum
          );
        });
      }

      totalOutputBytes += blob.size;
      const outputName = getEasyEditFilename(file.name, ext);
      const previewUrl = i === 0 ? URL.createObjectURL(blob) : undefined;

      outputFiles.push({
        name: outputName,
        blob,
        previewUrl,
      });
    }

    ctx.onProgress(100, 'Complete');

    return {
      files: outputFiles,
      stats: {
        inputBytes: totalInputBytes,
        outputBytes: totalOutputBytes,
      },
      notes: isTargetJpg ? ["Transparent areas were converted to clean white."] : undefined,
    };
  },
};

export default convertImageProcessor;

