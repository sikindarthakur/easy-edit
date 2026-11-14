import { formatBytes } from './formatters';
import { getEffectiveLimits } from './limits';
import { ToolLimits } from '@/tools/types';
import { t } from '@/i18n';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function readSliceBytes(file: File, length = 32): Promise<Uint8Array> {
  const slice = file.slice(0, length);
  if (typeof slice.arrayBuffer === 'function') {
    const buffer = await slice.arrayBuffer();
    return new Uint8Array(buffer);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(slice);
  });
}

export async function detectMagicBytes(file: File): Promise<string | null> {
  try {
    const bytes = await readSliceBytes(file, 32);
    if (bytes.length < 4) return null;

  // PDF: %PDF (0x25, 0x50, 0x44, 0x46)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'pdf';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg';
  }

  // WebP: RIFF ... WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }

  // ZIP: PK 03 04 or PK 05 06
  if (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06))
  ) {
    return 'zip';
  }

  // Text / CSV / JSON: detect printable text or UTF-8 BOM
  let isPrintable = true;
  for (let i = 0; i < Math.min(bytes.length, 32); i++) {
    const b = bytes[i];
    // Check for null bytes or control characters other than tab, CR, LF
    if (b === 0 || (b !== undefined && b < 8 && b !== 9 && b !== 10 && b !== 13)) {
      isPrintable = false;
      break;
    }
  }

  if (isPrintable) {
    return 'text';
  }

  return null;
  } catch {
    return null;
  }
}

export async function validateFiles(
  files: File[],
  acceptedFormats: string[],
  limits: ToolLimits,
  multiple: boolean
): Promise<ValidationResult> {
  const effectiveLimits = getEffectiveLimits(limits);

  // Check file count
  if (!multiple && files.length > 1) {
    return {
      valid: false,
      error: t('errors.tooManyFiles', { n: 1 }),
    };
  }

  if (files.length > effectiveLimits.maxFiles) {
    return {
      valid: false,
      error: t('errors.tooManyFiles', { n: effectiveLimits.maxFiles }),
    };
  }

  const maxSizeBytes = effectiveLimits.maxFileMB * 1024 * 1024;

  for (const file of files) {
    // Check size limit
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: t('errors.tooLarge', {
          size: formatBytes(file.size),
          limit: `${effectiveLimits.maxFileMB} MB`,
        }),
      };
    }

    // Check magic bytes / format
    const detectedType = await detectMagicBytes(file);
    const fileNameLower = file.name.toLowerCase();

    // Map acceptedFormats to expected types
    const acceptsPdf = acceptedFormats.some((f) => f.includes('pdf') || f === '.pdf');
    const acceptsImage = acceptedFormats.some(
      (f) =>
        f.includes('image') ||
        f === '.jpg' ||
        f === '.jpeg' ||
        f === '.png' ||
        f === '.webp'
    );
    const acceptsZip = acceptedFormats.some((f) => f.includes('zip') || f === '.zip');
    const acceptsSpreadsheet = acceptedFormats.some(
      (f) => f.includes('csv') || f.includes('json') || f === '.csv' || f === '.json'
    );
    const acceptsText = acceptedFormats.some(
      (f) => f.includes('markdown') || f === '.md' || f === '.txt'
    );
    const acceptsAny = acceptedFormats.includes('*') || acceptedFormats.length === 0;

    if (acceptsAny) {
      continue;
    }

    if (acceptsPdf) {
      if (detectedType !== 'pdf' && !fileNameLower.endsWith('.pdf')) {
        return {
          valid: false,
          error: t('errors.wrongFileType', { expected: 'PDF', extensions: '.pdf' }),
        };
      }
    } else if (acceptsZip) {
      if (detectedType !== 'zip' && !fileNameLower.endsWith('.zip')) {
        return {
          valid: false,
          error: t('errors.wrongFileType', { expected: 'ZIP archive', extensions: '.zip' }),
        };
      }
    } else if (acceptsImage) {
      const isImg =
        detectedType === 'png' ||
        detectedType === 'jpeg' ||
        detectedType === 'webp' ||
        fileNameLower.endsWith('.jpg') ||
        fileNameLower.endsWith('.jpeg') ||
        fileNameLower.endsWith('.png') ||
        fileNameLower.endsWith('.webp');

      if (!isImg) {
        return {
          valid: false,
          error: t('errors.wrongFileType', {
            expected: 'image',
            extensions: '.jpg, .png, .webp',
          }),
        };
      }
    } else if (acceptsSpreadsheet) {
      const isCsvOrJson =
        fileNameLower.endsWith('.csv') ||
        fileNameLower.endsWith('.json') ||
        detectedType === 'text';
      if (!isCsvOrJson) {
        return {
          valid: false,
          error: t('errors.wrongFileType', {
            expected: 'CSV or JSON',
            extensions: '.csv, .json',
          }),
        };
      }
    } else if (acceptsText) {
      if (detectedType !== 'text' && !fileNameLower.endsWith('.md') && !fileNameLower.endsWith('.txt')) {
        return {
          valid: false,
          error: t('errors.wrongFileType', {
            expected: 'Markdown',
            extensions: '.md, .txt',
          }),
        };
      }
    }
  }

  return { valid: true };
}
