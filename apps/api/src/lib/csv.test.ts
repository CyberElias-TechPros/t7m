import { describe, it, expect } from 'vitest';
import { toCsv } from './csv.js';

describe('toCsv', () => {
  it('renders headers and rows in column order', () => {
    const csv = toCsv([{ a: '1', b: '2' }, { a: '3', b: '4' }], ['a', 'b']);
    expect(csv).toBe('a,b\r\n1,2\r\n3,4');
  });

  it('quotes values containing commas, quotes, or newlines', () => {
    const csv = toCsv([{ x: 'hello, world', y: 'she said "hi"', z: 'line1\nline2' }], ['x', 'y', 'z']);
    expect(csv).toContain('"hello, world"');
    expect(csv).toContain('"she said ""hi"""');
    expect(csv).toContain('"line1\nline2"');
  });

  it('flattens string arrays and pair objects with pipes', () => {
    const csv = toCsv(
      [{ tags: ['minimal', 'bold'], brand: [{ name: 'Apple', why: 'clean' }] }],
      ['tags', 'brand'],
    );
    expect(csv).toContain('minimal | bold');
    expect(csv).toContain('Apple — clean');
  });

  it('renders empty values as empty cells', () => {
    const csv = toCsv([{ a: '', b: null, c: undefined as unknown as null }], ['a', 'b', 'c']);
    expect(csv).toBe('a,b,c\r\n,,');
  });
});
