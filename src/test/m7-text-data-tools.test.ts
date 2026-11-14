import { describe, it, expect } from 'vitest';
import { calculateWordStats } from '@/tools/document/wordCounter';
import { convertCase } from '@/tools/document/caseConverter';
import { formatJson, sortObjectKeys } from '@/tools/developer/jsonFormatter';
import {
  encodeBase64Text,
  decodeBase64Text,
  bytesToBase64,
  base64ToBytes,
} from '@/tools/developer/base64';
import { convertCsvToJson, convertJsonToCsv } from '@/tools/spreadsheet/csvJson';

describe('M7: Text and Data Tools Processors', () => {
  describe('Word Counter', () => {
    it('calculates comprehensive word, character, and sentence metrics', () => {
      const sample = 'Hello world! This is EasyEdit.\n\nA new paragraph here.';
      const stats = calculateWordStats(sample);

      expect(stats.words).toBe(9);
      expect(stats.sentences).toBe(3);
      expect(stats.paragraphs).toBe(2);
      expect(stats.charactersWithSpaces).toBe(sample.length);
      expect(stats.charactersWithoutSpaces).toBe(sample.replace(/\s/g, '').length);
      expect(stats.readingTimeMinutes).toBe(1);
    });

    it('returns zeroes for empty input', () => {
      const stats = calculateWordStats('   \n  ');
      expect(stats.words).toBe(0);
      expect(stats.charactersWithSpaces).toBe(0);
    });
  });

  describe('Case Converter', () => {
    it('converts to UPPERCASE and lowercase', () => {
      expect(convertCase('Hello World', 'upper')).toBe('HELLO WORLD');
      expect(convertCase('Hello World', 'lower')).toBe('hello world');
    });

    it('converts to Title Case and Sentence case', () => {
      expect(convertCase('easy edit file tools', 'title')).toBe('Easy Edit File Tools');
      expect(convertCase('hello world. this is easy edit.', 'sentence')).toBe(
        'Hello world. This is easy edit.'
      );
    });

    it('converts to developer naming styles: camelCase, snake_case, kebab-case', () => {
      expect(convertCase('User Profile Setting', 'camel')).toBe('userProfileSetting');
      expect(convertCase('User Profile Setting', 'snake')).toBe('user_profile_setting');
      expect(convertCase('User Profile Setting', 'kebab')).toBe('user-profile-setting');
    });
  });

  describe('JSON Formatter & Validator', () => {
    it('formats valid JSON with custom indentation and sorted keys', () => {
      const raw = '{"b": 2, "a": 1}';
      const res = formatJson(raw, '2', true);
      expect(res.error).toBeUndefined();
      expect(res.formatted).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('minifies JSON properly', () => {
      const raw = '{\n  "name": "EasyEdit",\n  "free": true\n}';
      const res = formatJson(raw, 'min');
      expect(res.formatted).toBe('{"name":"EasyEdit","free":true}');
    });

    it('reports exact line and column on syntax errors matching Section 11.3', () => {
      const broken = '{\n  "name": "EasyEdit",\n  "missing": \n}';
      const res = formatJson(broken);
      expect(res.error).toBeDefined();
      expect(res.error).toMatch(/Line \d+, column \d+:/);
    });

    it('sorts nested object keys recursively', () => {
      const nested = { z: 1, a: { y: 2, b: 3 } };
      const sorted = sortObjectKeys(nested) as Record<string, unknown>;
      expect(Object.keys(sorted)).toEqual(['a', 'z']);
      expect(Object.keys(sorted['a'] as Record<string, unknown>)).toEqual(['b', 'y']);
    });
  });

  describe('Base64 Encode/Decode', () => {
    it('encodes and decodes UTF-8 text accurately', () => {
      const text = 'Hello world! 🔒 Private & Free';
      const encoded = encodeBase64Text(text);
      expect(encoded).not.toBe(text);

      const decoded = decodeBase64Text(encoded);
      expect(decoded).toBe(text);
    });

    it('supports URL-safe Base64 without + or / or =', () => {
      const bytes = new Uint8Array([251, 239, 255]); // binary that produces '+' and '/'
      const urlSafe = bytesToBase64(bytes, true);
      expect(urlSafe).not.toContain('+');
      expect(urlSafe).not.toContain('/');
      expect(urlSafe).not.toContain('=');

      const restored = base64ToBytes(urlSafe);
      expect(Array.from(restored)).toEqual([251, 239, 255]);
    });
  });

  describe('CSV ⇄ JSON', () => {
    it('converts CSV to JSON with headers', () => {
      const csv = 'name,role,level\nAlice,Admin,5\nBob,User,1';
      const { json, previewRows } = convertCsvToJson(csv, true);
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(2);
      expect(parsed[0].name).toBe('Alice');
      expect(parsed[0].level).toBe(5);
      expect(previewRows.length).toBe(2);
    });

    it('converts JSON to CSV', () => {
      const json = JSON.stringify([
        { tool: 'Merge PDF', category: 'PDF' },
        { tool: 'Resize Image', category: 'Image' },
      ]);
      const { csv, previewRows } = convertJsonToCsv(json);
      expect(csv).toContain('tool,category');
      expect(csv).toContain('Merge PDF,PDF');
      expect(previewRows.length).toBeGreaterThan(0);
    });
  });
});
