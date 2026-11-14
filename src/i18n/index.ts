import en from './en.json';

type TranslationTree = typeof en;

export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.');
  let current: unknown = en;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (!params) {
    return current;
  }

  let result = current;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
  }

  return result;
}

export default en;
export type { TranslationTree };
