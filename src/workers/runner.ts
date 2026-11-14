import { ToolDefinition, ToolResult, ProcessingContext } from '@/tools/types';
import { t } from '@/i18n';

export interface RunProcessorOptions {
  tool: ToolDefinition;
  files: File[];
  options: Record<string, unknown>;
  signal: AbortSignal;
  onProgress: (percent: number, label?: string) => void;
}

export async function runToolProcessor({
  tool,
  files,
  options,
  signal,
  onProgress,
}: RunProcessorOptions): Promise<ToolResult> {
  if (signal.aborted) {
    throw new Error(t('errors.cancelled'));
  }

  // Load the processor module dynamically (lazy-loading)
  onProgress(5, 'Loading tool module…');
  const module = await tool.load();
  const processor = module.default;

  if (!processor || typeof processor.process !== 'function') {
    throw new Error(`Processor for ${tool.id} is invalid or not found.`);
  }

  if (signal.aborted) {
    throw new Error(t('errors.cancelled'));
  }

  const context: ProcessingContext = {
    files,
    options,
    signal,
    onProgress: (percent, label) => {
      if (!signal.aborted) {
        onProgress(percent, label);
      }
    },
  };

  try {
    const result = await processor.process(context);
    if (signal.aborted) {
      throw new Error(t('errors.cancelled'));
    }
    return result;
  } catch (err: unknown) {
    if (signal.aborted || (err instanceof Error && err.name === 'AbortError')) {
      throw new Error(t('errors.cancelled'));
    }
    throw err;
  }
}
