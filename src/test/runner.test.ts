import { describe, it, expect, vi } from 'vitest';
import { runToolProcessor } from '@/workers/runner';
import { ToolDefinition, ToolProcessor } from '@/tools/types';

describe('Worker Runner & Processor Pipeline', () => {
  const mockProcessor: ToolProcessor = {
    async process(ctx) {
      ctx.onProgress(50, 'Halfway');
      return {
        files: [
          {
            name: 'output-easyedit.pdf',
            blob: new Blob(['result']),
          },
        ],
        stats: {
          inputBytes: 100,
          outputBytes: 50,
        },
      };
    },
  };

  const mockTool: ToolDefinition = {
    id: 'test-tool',
    name: 'Test Tool',
    title: 'Test Tool H1',
    description: 'Test description',
    category: 'pdf',
    route: '/pdf/test',
    keywords: ['test'],
    acceptedFormats: ['.pdf'],
    multiple: false,
    processingMode: 'browser',
    limits: { maxFileMB: 10, maxFiles: 1 },
    options: [],
    primaryActionLabel: 'Run Test',
    steps: ['Step 1'],
    faq: [{ q: 'Q?', a: 'A.' }],
    related: [],
    enabled: true,
    load: async () => ({ default: mockProcessor }),
  };

  it('runs processor and reports progress', async () => {
    const progressSpy = vi.fn();
    const abortController = new AbortController();

    const file = new File(['dummy'], 'sample.pdf', { type: 'application/pdf' });

    const result = await runToolProcessor({
      tool: mockTool,
      files: [file],
      options: {},
      signal: abortController.signal,
      onProgress: progressSpy,
    });

    expect(result.files.length).toBe(1);
    expect(result.files[0]?.name).toBe('output-easyedit.pdf');
    expect(result.stats?.outputBytes).toBe(50);
    expect(progressSpy).toHaveBeenCalledWith(50, 'Halfway');
  });

  it('handles cancellation gracefully via AbortSignal', async () => {
    const abortController = new AbortController();
    abortController.abort(); // already aborted

    const file = new File(['dummy'], 'sample.pdf', { type: 'application/pdf' });

    await expect(
      runToolProcessor({
        tool: mockTool,
        files: [file],
        options: {},
        signal: abortController.signal,
        onProgress: vi.fn(),
      })
    ).rejects.toThrow('Cancelled');
  });
});
