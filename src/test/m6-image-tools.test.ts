import { describe, it, expect, vi } from 'vitest';
import { compressImageProcessor } from '@/tools/image/compress';
import { convertImageProcessor } from '@/tools/image/convert';

describe('M6: Image Tools Processors', () => {
  it('handles empty image input gracefully across all processors', async () => {
    const abortController = new AbortController();
    const ctx = {
      files: [],
      options: {},
      signal: abortController.signal,
      onProgress: vi.fn(),
    };

    await expect(compressImageProcessor.process(ctx)).rejects.toThrow();
    await expect(convertImageProcessor.process(ctx)).rejects.toThrow();
  });
});
