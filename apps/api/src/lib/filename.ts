/**
 * Sanitizes user-supplied filenames for safe use as R2 object-key suffixes:
 * strips path components, collapses unsafe characters, and caps length.
 */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'file';
  const cleaned = base
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/\s+/g, '-')
    .replace(/[_]+/g, '_')
    .replace(/-+/g, '-')
    .slice(0, 120)
    .replace(/^[.\-_]+/, '');
  return cleaned || 'file';
}
