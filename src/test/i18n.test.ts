import { describe, it, expect } from 'vitest';
import { t } from '@/i18n';

describe('i18n & Exact PRD Copy', () => {
  it('returns exact global copy as specified in Section 11.1', () => {
    expect(t('global.heroHeadline')).toBe('Every file tool you need. Free.');
    expect(t('global.heroSubhead')).toBe(
      'Merge, compress, convert and edit files in seconds. No sign-up. Your files never leave your device.'
    );
    expect(t('global.searchPlaceholder')).toBe('Search tools, e.g. "merge PDF"');
    expect(t('global.privacyBadge')).toBe('🔒 Runs on your device. Your file is never uploaded.');
    expect(t('global.uploadZoneDesktop')).toBe('Drag files here, or choose files');
    expect(t('global.uploadZoneMobile')).toBe('Choose files');
    expect(t('global.dragOver')).toBe('Drop to add');
    expect(t('global.footer')).toBe('Free to use. Built to respect your privacy.');
    expect(t('global.emptyToolState')).toBe(
      'Add a file to get started. Your file stays on your device.'
    );
    expect(t('global.firstVisitTip')).toBe('Tip: press / to search all tools.');
  });

  it('interpolates dynamic parameters correctly', () => {
    expect(t('global.processing', { percent: 45 })).toBe('Working on it… 45%');
    expect(
      t('global.successDetail', {
        oldSize: '2.5 MB',
        newSize: '800 KB',
        percent: 68,
      })
    ).toBe('2.5 MB → 800 KB (68% smaller)');
    expect(
      t('errors.tooLarge', { size: '120 MB', limit: '100 MB' })
    ).toBe('This file is 120 MB. The limit for this tool is 100 MB. Try compressing it first.');
  });
});
