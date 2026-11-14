import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename, uint8ArrayToBlob } from '@/lib/download';

export interface RenderedMarkdown {
  html: string;
  sanitized: string;
}

export function renderMarkdownSafe(mdText: string): RenderedMarkdown {
  const rawHtml = marked.parse(mdText) as string;
  const sanitized = DOMPurify.sanitize(rawHtml);
  return { html: rawHtml, sanitized };
}

function toPdfSafeText(str: string): string {
  return str
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

async function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return await file.text();
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export const markdownToPdfProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    let markdownContent = '';

    if (file) {
      markdownContent = await readFileAsText(file);
    } else if (typeof ctx.options.text === 'string') {
      markdownContent = ctx.options.text;
    }

    if (!markdownContent.trim()) {
      throw new Error('Please enter or upload Markdown content.');
    }

    ctx.onProgress(20, 'Parsing and sanitizing Markdown…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    // Parse and sanitize
    const { sanitized } = renderMarkdownSafe(markdownContent);

    ctx.onProgress(50, 'Formatting document layout…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pageSizeOpt = (ctx.options.pageSize as string) || 'a4';
    const isLetter = pageSizeOpt === 'letter';

    // Page dimensions in pt
    const widthPt = isLetter ? 612 : 595.28;
    const heightPt = isLetter ? 792 : 841.89;

    const pdfDoc = await PDFDocument.create();

    const themeOpt = (ctx.options.theme as string) || 'clean';
    const isAcademic = themeOpt === 'academic';

    const regularFont = await pdfDoc.embedFont(
      isAcademic ? StandardFonts.TimesRoman : StandardFonts.Helvetica
    );
    const boldFont = await pdfDoc.embedFont(
      isAcademic ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold
    );

    // Extract clean lines from sanitized content
    let plainText = '';
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitized;
      plainText = tempDiv.innerText || tempDiv.textContent || '';
    } else {
      plainText = sanitized.replace(/<[^>]*>?/gm, '');
    }

    const lines = plainText.split('\n');

    let currentPage = pdfDoc.addPage([widthPt, heightPt]);
    let curY = 50; // top margin
    const marginX = 50;
    const marginTop = 50;
    const marginBottom = 50;
    const maxY = heightPt - marginBottom;

    ctx.onProgress(70, 'Drawing formatted pages…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    for (const rawLine of lines) {
      const line = toPdfSafeText(rawLine);
      let fontSize = 11;
      let font = regularFont;
      let spacing = 16;
      let textToDraw = line;

      if (line.startsWith('# ')) {
        fontSize = 20;
        font = boldFont;
        spacing = 26;
        textToDraw = line.slice(2).trim();
        curY += 8;
      } else if (line.startsWith('## ')) {
        fontSize = 16;
        font = boldFont;
        spacing = 22;
        textToDraw = line.slice(3).trim();
        curY += 6;
      } else if (line.startsWith('### ')) {
        fontSize = 13;
        font = boldFont;
        spacing = 18;
        textToDraw = line.slice(4).trim();
        curY += 4;
      }

      if (curY + spacing > maxY) {
        currentPage = pdfDoc.addPage([widthPt, heightPt]);
        curY = marginTop;
      }

      if (textToDraw.trim().length > 0) {
        currentPage.drawText(textToDraw, {
          x: marginX,
          y: heightPt - curY,
          size: fontSize,
          font,
          color: rgb(0.12, 0.16, 0.23), // slate-800
        });
      }

      curY += spacing;
    }

    ctx.onProgress(90, 'Compiling PDF document…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const pdfBytes = await pdfDoc.save();
    const outputBlob = uint8ArrayToBlob(pdfBytes, 'application/pdf');

    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    const outputName = getEasyEditFilename(`${baseName}.pdf`, 'pdf');

    ctx.onProgress(100, 'Complete');

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
        },
      ],
      stats: {
        inputBytes: file?.size || markdownContent.length,
        outputBytes: outputBlob.size,
      },
    };
  },
};

export default markdownToPdfProcessor;
