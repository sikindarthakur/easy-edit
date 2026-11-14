import { ToolProcessor, ProcessingContext, ToolResult } from '../types';

export interface WordCountStats {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export function calculateWordStats(text: string): WordCountStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      words: 0,
      charactersWithSpaces: 0,
      charactersWithoutSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed.split(/[.!?]+(?:\s+|$)/).filter(Boolean).length;
  const paragraphs = trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    charactersWithSpaces,
    charactersWithoutSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
  };
}

export const wordCounterProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    let content = '';

    if (file) {
      content = await file.text();
    } else if (typeof ctx.options.text === 'string') {
      content = ctx.options.text;
    }

    const stats = calculateWordStats(content);
    const summaryText = `Words: ${stats.words}\nCharacters (with spaces): ${stats.charactersWithSpaces}\nCharacters (no spaces): ${stats.charactersWithoutSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading time: ~${stats.readingTimeMinutes} min`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });

    return {
      files: [
        {
          name: 'word-count-summary.txt',
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

export default wordCounterProcessor;

