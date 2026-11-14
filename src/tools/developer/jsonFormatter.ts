import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { t } from '@/i18n';

export interface JsonFormatResult {
  formatted: string;
  error?: string;
}

export function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    for (const key of keys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return obj;
}

export function parseJsonLineCol(err: Error, text: string): { line: number; col: number; reason: string } {
  let line = 1;
  let col = 1;
  let reason = err.message;

  // Check for position in error message e.g. "at position 42"
  const posMatch = err.message.match(/at position (\d+)/);
  if (posMatch && posMatch[1]) {
    const pos = parseInt(posMatch[1], 10);
    const beforePos = text.slice(0, pos);
    const lines = beforePos.split('\n');
    line = lines.length;
    col = (lines[lines.length - 1]?.length || 0) + 1;
  } else {
    // Check for "line X column Y"
    const lineColMatch = err.message.match(/line (\d+) column (\d+)/i);
    if (lineColMatch && lineColMatch[1] && lineColMatch[2]) {
      line = parseInt(lineColMatch[1], 10);
      col = parseInt(lineColMatch[2], 10);
    }
  }

  // Clean reason string
  reason = reason.replace(/\s*\(line \d+ column \d+\)/i, '').replace(/at position \d+/i, '').trim();

  return { line, col, reason };
}

export function formatJson(
  rawJson: string,
  indentOpt: string = '2',
  sortKeys: boolean = false
): JsonFormatResult {
  const trimmed = rawJson.trim();
  if (!trimmed) {
    return { formatted: '' };
  }

  try {
    let parsed = JSON.parse(trimmed);
    if (sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    let indentSpacing: string | number = 2;
    if (indentOpt === '4') indentSpacing = 4;
    else if (indentOpt === 'tab') indentSpacing = '\t';
    else if (indentOpt === 'min') indentSpacing = 0;

    const formatted = JSON.stringify(parsed, null, indentSpacing);
    return { formatted };
  } catch (err: unknown) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const { line, col, reason } = parseJsonLineCol(errorObj, rawJson);
    const formattedError = t('errors.invalidJson', { line, col, reason });
    return { formatted: rawJson, error: formattedError };
  }
}

export const jsonFormatterProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    let content = '';

    if (file) {
      content = await file.text();
    } else if (typeof ctx.options.text === 'string') {
      content = ctx.options.text;
    }

    const indent = (ctx.options.indent as string) || '2';
    const sortKeys = Boolean(ctx.options.sortKeys);

    const result = formatJson(content, indent, sortKeys);
    if (result.error) {
      throw new Error(result.error);
    }

    const blob = new Blob([result.formatted], { type: 'application/json' });

    return {
      files: [
        {
          name: 'formatted-easyedit.json',
          blob,
        },
      ],
      stats: {
        inputBytes: file?.size || content.length,
        outputBytes: blob.size,
      },
    };
  },
};

export default jsonFormatterProcessor;

