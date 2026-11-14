import { unzipSync } from 'fflate';
import { ToolProcessor, ProcessingContext, ToolResult, OutputFile } from '../types';
import { isMobileDevice } from '@/lib/limits';
import { uint8ArrayToBlob } from '@/lib/download';
import { t } from '@/i18n';

export const zipExtractProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) throw new Error('Please select a ZIP file.');

    ctx.onProgress(15, 'Reading archive…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Limits check
    const isMobile = isMobileDevice();
    const maxEntries = isMobile ? 500 : 2000;
    const maxUncompressedBytes = isMobile ? 300 * 1024 * 1024 : 1024 * 1024 * 1024;

    ctx.onProgress(35, 'Decompressing and validating contents…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    let unzipped: Record<string, Uint8Array>;
    try {
      unzipped = unzipSync(bytes, {
        filter(fileInfo) {
          // Check for path traversal or absolute paths (Security FR-12)
          const name = fileInfo.name;
          if (
            name.includes('../') ||
            name.includes('..\\') ||
            name.startsWith('/') ||
            /^[a-zA-Z]:/.test(name)
          ) {
            throw new Error('Unsafe path detected');
          }
          return true;
        },
      });
    } catch {
      throw new Error(t('errors.zipUnsafe'));
    }

    const entryNames = Object.keys(unzipped);

    if (entryNames.length > maxEntries) {
      throw new Error(t('errors.zipUnsafe'));
    }

    ctx.onProgress(70, 'Unpacking extracted files…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const outputFiles: OutputFile[] = [];
    let totalUncompressedBytes = 0;

    for (const name of entryNames) {
      // Skip directory placeholder entries ending with /
      if (name.endsWith('/')) continue;

      const fileData = unzipped[name];
      if (!fileData) continue;

      totalUncompressedBytes += fileData.byteLength;
      if (totalUncompressedBytes > maxUncompressedBytes) {
        throw new Error(t('errors.zipUnsafe'));
      }

      // Check compression ratio bomb (e.g. > 100x expansion)
      if (file.size > 0 && totalUncompressedBytes / file.size > 100) {
        throw new Error(t('errors.zipUnsafe'));
      }

      // Sanitize output filename to flat basename or safe subfolder name
      const safeName = name.replace(/^(\.\.(\/|\\|$))+/, '');
      const blob = uint8ArrayToBlob(fileData, 'application/octet-stream');

      outputFiles.push({
        name: safeName,
        blob,
      });
    }

    ctx.onProgress(100, 'Complete');

    return {
      files: outputFiles,
      stats: {
        inputBytes: file.size,
        outputBytes: totalUncompressedBytes,
      },
    };
  },
};

export default zipExtractProcessor;

