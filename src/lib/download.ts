import { OutputFile } from '@/tools/types';
import { zipSync } from 'fflate';

export function uint8ArrayToBlob(bytes: Uint8Array, mimeType: string): Blob {
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Blob([ab], { type: mimeType });
}

export function getEasyEditFilename(originalName: string, newExt?: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const currentExt = dotIndex !== -1 ? originalName.slice(dotIndex + 1) : '';
  const finalExt = newExt ? newExt.replace(/^\./, '') : currentExt;

  return `${baseName}-easyedit${finalExt ? `.${finalExt}` : ''}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke object URL after a short timeout to allow download to trigger
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function downloadFilesAsZip(files: OutputFile[], zipFilename: string): Promise<void> {
  const zipData: Record<string, Uint8Array> = {};

  for (const file of files) {
    const arrayBuffer = await file.blob.arrayBuffer();
    zipData[file.name] = new Uint8Array(arrayBuffer);
  }

  // Compress using fflate
  const zipped = zipSync(zipData, { level: 6 });
  const blob = uint8ArrayToBlob(zipped, 'application/zip');
  downloadBlob(blob, zipFilename);
}

export async function downloadResults(results: OutputFile[], defaultZipName = 'easyedit-results.zip'): Promise<void> {
  if (results.length === 1 && results[0]) {
    downloadBlob(results[0].blob, results[0].name);
  } else if (results.length > 1) {
    await downloadFilesAsZip(results, defaultZipName);
  }
}
