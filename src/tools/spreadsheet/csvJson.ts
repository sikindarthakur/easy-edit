import Papa from 'papaparse';
import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { getEasyEditFilename } from '@/lib/download';

export interface CsvJsonOptions {
  direction?: 'auto' | 'csv2json' | 'json2csv';
  hasHeader?: boolean;
}

export function convertCsvToJson(
  csvText: string,
  hasHeader: boolean = true
): { json: string; previewRows: (string[] | Record<string, string>)[] } {
  const parsed = Papa.parse(csvText, {
    header: hasHeader,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
    throw new Error(`CSV Parsing Error: ${parsed.errors[0]?.message || 'Invalid CSV'}`);
  }

  const jsonString = JSON.stringify(parsed.data, null, 2);
  const previewRows = (parsed.data as (string[] | Record<string, string>)[]).slice(0, 50);

  return { json: jsonString, previewRows };
}

export function convertJsonToCsv(jsonText: string): { csv: string; previewRows: string[][] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON input format.');
  }

  if (!Array.isArray(parsed)) {
    // If single object, wrap in array
    if (parsed && typeof parsed === 'object') {
      parsed = [parsed];
    } else {
      throw new Error('JSON data must be an array of objects or values to convert to CSV.');
    }
  }

  const csv = Papa.unparse(parsed as Record<string, unknown>[]);
  const parsedPreview = Papa.parse(csv, { header: false, preview: 50 });

  return { csv, previewRows: parsedPreview.data as string[][] };
}

export const csvJsonProcessor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    if (!file) throw new Error('Please select a CSV or JSON file.');

    ctx.onProgress(15, 'Reading input file…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    const content = await file.text();
    const fileName = file.name.toLowerCase();

    let direction = (ctx.options.direction as string) || 'auto';
    if (direction === 'auto') {
      if (fileName.endsWith('.json')) direction = 'json2csv';
      else direction = 'csv2json';
    }

    const hasHeader = ctx.options.hasHeader !== false;

    ctx.onProgress(50, 'Converting spreadsheet data…');
    if (ctx.signal.aborted) throw new Error('Cancelled');

    let outputBlob: Blob;
    let outputExt: string;

    if (direction === 'csv2json') {
      const { json } = convertCsvToJson(content, hasHeader);
      outputBlob = new Blob([json], { type: 'application/json' });
      outputExt = 'json';
    } else {
      const { csv } = convertJsonToCsv(content);
      outputBlob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      outputExt = 'csv';
    }

    ctx.onProgress(100, 'Complete');

    const outputName = getEasyEditFilename(file.name, outputExt);

    return {
      files: [
        {
          name: outputName,
          blob: outputBlob,
        },
      ],
      stats: {
        inputBytes: file.size,
        outputBytes: outputBlob.size,
      },
    };
  },
};

export default csvJsonProcessor;

