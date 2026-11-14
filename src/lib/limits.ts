import { ToolLimits } from '@/tools/types';

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768);
}

export function getEffectiveLimits(baseLimits: ToolLimits): ToolLimits {
  const isMobile = isMobileDevice();
  if (!isMobile) {
    return baseLimits;
  }

  return {
    maxFileMB: Math.min(baseLimits.maxFileMB, 50),
    maxFiles: Math.min(baseLimits.maxFiles, 20),
    maxPages: baseLimits.maxPages ? Math.min(baseLimits.maxPages, 300) : undefined,
    maxMegapixels: baseLimits.maxMegapixels ? Math.min(baseLimits.maxMegapixels, 50) : undefined,
  };
}

export const GLOBAL_LIMITS = {
  desktop: {
    maxFileMB: 100,
    maxFiles: 20,
    maxPages: 500,
    maxMegapixels: 100,
    zipMaxEntries: 2000,
    zipMaxUncompressedBytes: 1024 * 1024 * 1024, // 1 GB
  },
  mobile: {
    maxFileMB: 50,
    maxFiles: 20,
    maxPages: 300,
    maxMegapixels: 50,
    zipMaxEntries: 500,
    zipMaxUncompressedBytes: 300 * 1024 * 1024, // 300 MB
  },
};
