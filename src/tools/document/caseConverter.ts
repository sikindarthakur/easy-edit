import { ToolProcessor, ProcessingContext, ToolResult } from '../types';

export function convertCase(
  text: string,
  mode: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab'
): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase();

    case 'lower':
      return text.toLowerCase();

    case 'title':
      return text.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
      );

    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    case 'camel': {
      const words = text
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .trim()
        .split(/\s+/);
      return words
        .map((w, idx) =>
          idx === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
        )
        .join('');
    }

    case 'snake':
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();

    case 'kebab':
      return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    default:
      return text;
  }
}

export const caseConverterProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    let content = '';

    if (file) {
      content = await file.text();
    } else if (typeof ctx.options.text === 'string') {
      content = ctx.options.text;
    }

    const mode = (ctx.options.mode as 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab') || 'upper';
    const converted = convertCase(content, mode);
    const blob = new Blob([converted], { type: 'text/plain;charset=utf-8' });

    return {
      files: [
        {
          name: 'converted-text.txt',
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

export default caseConverterProcessor;

