/**
 * Minimal RFC 4180 CSV serializer. Flattens a submission's structured answers
 * into one column per questionnaire field for the admin export.
 */

function csvCell(value: unknown): string {
  let s: string;
  if (value == null) {
    s = '';
  } else if (Array.isArray(value)) {
    s = value
      .map((v) => (typeof v === 'object' && v !== null ? `${v.name} — ${v.why}` : String(v)))
      .join(' | ');
  } else if (typeof value === 'object') {
    s = JSON.stringify(value);
  } else {
    s = String(value);
  }
  if (/[",\n\r]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export interface CsvRow {
  [key: string]: unknown;
}

export function toCsv(rows: CsvRow[], columns: string[]): string {
  const header = columns.map(csvCell).join(',');
  const body = rows.map((row) => columns.map((col) => csvCell(row[col])).join(','));
  return [header, ...body].join('\r\n');
}
