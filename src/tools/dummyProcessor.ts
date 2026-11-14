import { ToolProcessor, ProcessingContext, ToolResult } from './types';

export const dummyProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    ctx.onProgress(25, 'Reading files...');
    await new Promise((r) => setTimeout(r, 100));
    if (ctx.signal.aborted) throw new Error('Cancelled');

    ctx.onProgress(75, 'Processing...');
    await new Promise((r) => setTimeout(r, 100));
    if (ctx.signal.aborted) throw new Error('Cancelled');

    ctx.onProgress(100, 'Complete');

    return {
      files: ctx.files.map((f) => ({
        name: f.name.replace(/\.[^/.]+$/, '') + '-easyedit' + (f.name.includes('.') ? f.name.slice(f.name.lastIndexOf('.')) : ''),
        blob: f,
      })),
      stats: {
        inputBytes: ctx.files.reduce((acc, f) => acc + f.size, 0),
        outputBytes: ctx.files.reduce((acc, f) => acc + f.size, 0),
      },
    };
  },
};

export default dummyProcessor;
