import { ToolProcessor, ProcessingContext, ToolResult } from '../types';
import { uint8ArrayToBlob } from '@/lib/download';

export function bytesToBase64(bytes: Uint8Array, urlSafe: boolean = false): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  let base64 = btoa(binary);

  if (urlSafe) {
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  return base64;
}

export function base64ToBytes(base64Str: string): Uint8Array {
  let normalized = base64Str.trim().replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' if missing
  while (normalized.length % 4 !== 0) {
    normalized += '=';
  }

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64Text(text: string, urlSafe: boolean = false): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return bytesToBase64(bytes, urlSafe);
}

export function decodeBase64Text(base64: string): string {
  const bytes = base64ToBytes(base64);
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

export const base64Processor: ToolProcessor = {
  async process(ctx: ProcessingContext): Promise<ToolResult> {
    const file = ctx.files[0];
    const mode = (ctx.options.mode as string) || 'encode';
    const urlSafe = Boolean(ctx.options.urlSafe);

    if (mode === 'encode') {
      if (file) {
        const buffer = await file.arrayBuffer();
        const base64 = bytesToBase64(new Uint8Array(buffer), urlSafe);
        const blob = new Blob([base64], { type: 'text/plain;charset=utf-8' });
        return {
          files: [
            {
              name: `${file.name}-base64.txt`,
              blob,
            },
          ],
          stats: {
            inputBytes: file.size,
            outputBytes: blob.size,
          },
        };
      } else {
        const text = (ctx.options.text as string) || '';
        const encoded = encodeBase64Text(text, urlSafe);
        const blob = new Blob([encoded], { type: 'text/plain;charset=utf-8' });
        return {
          files: [
            {
              name: 'encoded-base64.txt',
              blob,
            },
          ],
          stats: {
            inputBytes: text.length,
            outputBytes: blob.size,
          },
        };
      }
    } else {
      // Decode
      let base64String = '';
      if (file) {
        base64String = await file.text();
      } else {
        base64String = (ctx.options.text as string) || '';
      }

      try {
        const decodedBytes = base64ToBytes(base64String);
        const blob = uint8ArrayToBlob(decodedBytes, 'application/octet-stream');
        return {
          files: [
            {
              name: 'decoded-file.bin',
              blob,
            },
          ],
          stats: {
            inputBytes: base64String.length,
            outputBytes: blob.size,
          },
        };
      } catch {
        throw new Error('Invalid Base64 string.');
      }
    }
  },
};

export default base64Processor;
