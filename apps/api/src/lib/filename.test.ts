import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from './filename.js';

describe('sanitizeFilename', () => {
  it('strips path components', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('C:\\Users\\jane\\logo final.png')).toBe('logo-final.png');
  });

  it('replaces unsafe characters and spaces', () => {
    expect(sanitizeFilename('my logo (v2)!.png')).toBe('my-logo-_v2_.png');
    expect(sanitizeFilename('sketch--draft  01.jpg')).toBe('sketch-draft-01.jpg');
  });

  it('never returns an empty or dot-only name', () => {
    expect(sanitizeFilename('...')).toBe('file');
    expect(sanitizeFilename('!!!')).toBe('file');
    expect(sanitizeFilename('')).toBe('file');
  });

  it('caps length', () => {
    expect(sanitizeFilename('a'.repeat(200) + '.png').length).toBeLessThanOrEqual(120);
  });
});
