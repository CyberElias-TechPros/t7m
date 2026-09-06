'use client';

import { useRef, useState } from 'react';
import { MAX_FILE_BYTES, MAX_UPLOAD_BYTES, ALLOWED_UPLOAD_TYPES } from '@t7m/shared';

const MAX_FILES = 8;

export function FileDropzone({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<string[]>([]);

  const totalBytes = files.reduce((s, f) => s + f.size, 0);

  function addFiles(incoming: FileList | File[]) {
    const next = [...files];
    const errors: string[] = [];
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_FILES) {
        errors.push(`“${file.name}” — limit of ${MAX_FILES} files.`);
        continue;
      }
      const type = file.type || 'application/octet-stream';
      if (!ALLOWED_UPLOAD_TYPES.includes(type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
        errors.push(`“${file.name}” — file type not allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`“${file.name}” — exceeds ${MAX_FILE_BYTES / 1024 / 1024} MB per file.`);
        continue;
      }
      if (totalBytes + file.size > MAX_UPLOAD_BYTES) {
        errors.push(`“${file.name}” — would exceed the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB total.`);
        continue;
      }
      next.push(file);
    }
    setRejected(errors);
    onChange(next);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Attach reference files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition ' +
          (dragging ? 'border-accent bg-accent-soft' : 'border-line bg-paper hover:border-accent/50')
        }
      >
        <span className="text-2xl" aria-hidden>📎</span>
        <span className="mt-2 text-sm font-semibold">
          Drop files here or <span className="text-accent underline">browse</span>
        </span>
        <span className="mt-1 text-xs text-ink-faint">
          Images, PDF, or ZIP · up to {MAX_FILE_BYTES / 1024 / 1024} MB each ·{' '}
          {MAX_UPLOAD_BYTES / 1024 / 1024} MB total · {MAX_FILES} files max
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_UPLOAD_TYPES.join(',')}
          className="sr-only-ish"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {rejected.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] font-medium text-red-600" role="alert">
          {rejected.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden>📄</span>
                <span className="truncate font-medium">{f.name}</span>
                <span className="shrink-0 text-xs text-ink-faint">{formatSize(f.size)}</span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="ml-2 rounded px-2 py-1 text-ink-faint hover:bg-paper hover:text-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
