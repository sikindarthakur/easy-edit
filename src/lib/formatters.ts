export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  const sizeUnit = sizes[safeI];

  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(dm))} ${sizeUnit}`;
}

export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

export function calculateSavings(
  inputBytes: number,
  outputBytes: number
): { percent: number; smaller: boolean } {
  if (inputBytes <= 0) return { percent: 0, smaller: false };
  const diff = inputBytes - outputBytes;
  const percent = Math.round((diff / inputBytes) * 100);
  return {
    percent: Math.abs(percent),
    smaller: diff > 0,
  };
}
