import { describe, it, expect } from 'vitest';
import { detectMagicBytes, validateFiles } from '@/lib/fileValidation';

describe('fileValidation & Magic Byte Detection', () => {
  it('identifies PDF magic bytes', async () => {
    // %PDF-
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
    const file = new File([pdfBytes], 'test.pdf', { type: 'application/pdf' });
    const detected = await detectMagicBytes(file);
    expect(detected).toBe('pdf');
  });

  it('identifies PNG magic bytes', async () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngBytes], 'image.png', { type: 'image/png' });
    const detected = await detectMagicBytes(file);
    expect(detected).toBe('png');
  });

  it('identifies JPEG magic bytes', async () => {
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const file = new File([jpegBytes], 'photo.jpg', { type: 'image/jpeg' });
    const detected = await detectMagicBytes(file);
    expect(detected).toBe('jpeg');
  });

  it('identifies ZIP magic bytes', async () => {
    const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const file = new File([zipBytes], 'archive.zip', { type: 'application/zip' });
    const detected = await detectMagicBytes(file);
    expect(detected).toBe('zip');
  });

  it('rejects files exceeding size limits', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    // Create mock oversized file
    const oversizedFile = new File([pdfBytes], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 150 * 1024 * 1024 });

    const result = await validateFiles(
      [oversizedFile],
      ['.pdf'],
      { maxFileMB: 100, maxFiles: 5 },
      true
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain('The limit for this tool is 100 MB');
  });

  it('rejects multiple files when multiple is false', async () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    const file1 = new File([pdfBytes], 'one.pdf');
    const file2 = new File([pdfBytes], 'two.pdf');

    const result = await validateFiles(
      [file1, file2],
      ['.pdf'],
      { maxFileMB: 100, maxFiles: 1 },
      false
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe('You can add up to 1 files at once.');
  });
});
