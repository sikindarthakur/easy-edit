import { describe, it, expect } from 'vitest';
import { formatBytes, formatPercent, calculateSavings } from '@/lib/formatters';

describe('formatters', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(104857600)).toBe('100 MB');
  });

  it('formats percentage correctly', () => {
    expect(formatPercent(45.2)).toBe('45%');
    expect(formatPercent(68.8)).toBe('69%');
  });

  it('calculates savings correctly', () => {
    const savings = calculateSavings(1000, 400);
    expect(savings.smaller).toBe(true);
    expect(savings.percent).toBe(60);
  });
});
