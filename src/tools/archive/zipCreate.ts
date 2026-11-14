import { zipSync, Zippable } from 'fflate';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { uint8ArrayToBlob } from '@/lib/download';

export const zipCreateProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    if (!ctx.files || ctx.files.length === 0) {
      throw new Error('Please select at least one file to create an archive.');
    }

    ctx.onProgress(15, 'Reading input files…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const totalFiles = ctx.files.length;
    const zipData: Zippable = {};
    let totalInputBytes = 0;

    const levelOpt = Number(ctx.options.compressionLevel);
    // fflate level: 0 to 9 (0: store, 1: fast, 6: default, 9: max)
    const level = (isNaN(levelOpt) ? 6 : levelOpt) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    for (let i = 0; i < totalFiles; i++) {
      const file = ctx.files[i];
      if (!file) continue;

      totalInputBytes += file.size;
      const progress = 20 + Math.round((i / totalFiles) * 60);
      ctx.onProgress(progress, `Compressing ${file.name} (${i + 1}/${totalFiles})…`);

      if (ctx.signal.aborted) throw new Error('Cancelled');

      const buffer = await file.arrayBuffer();
      zipData[file.name] = new Uint8Array(buffer);
    }

    ctx.onProgress(85, 'Building ZIP archive…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const zippedBytes = zipSync(zipData, { level });
    const outputBlob = uint8ArrayToBlob(zippedBytes, 'application/zip');

    let archiveName = (ctx.options.zipName as string) || 'archive.zip';
    if (!archiveName.endsWith('.zip')) {
      archiveName += '.zip';
    }

    ctx.onProgress(100, 'Complete');

    return {
      files: [
        {
          name: archiveName,
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

export default zipCreateProcessor;

