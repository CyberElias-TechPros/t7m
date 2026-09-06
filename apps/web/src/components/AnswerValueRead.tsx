'use client';

import type { AnswerValue, FieldDef, PairEntry } from '@t7m/shared';

/** Read-only rendering of an answer in the admin detail view. */
export function AnswerValueRead({ field, value }: { field: FieldDef; value: AnswerValue | undefined }) {
  if (value === undefined || value === null || value === '') {
    return <span className="italic text-ink-faint">—</span>;
  }

  if (typeof value === 'string') {
    const opt = field.options?.find((o) => o.value === value);
    return <span className="whitespace-pre-wrap text-ink">{opt?.label ?? value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="italic text-ink-faint">—</span>;

    if (typeof value[0] === 'string') {
      const strings = value as string[];
      const labels = strings.map((v) => field.options?.find((o) => o.value === v)?.label ?? v);
      return (
        <span className="flex flex-wrap gap-1.5">
          {labels.map((l, i) => (
            <span
              key={`${l}-${i}`}
              className="rounded-full border border-violet-bright/40 bg-violet/20 px-2.5 py-0.5 text-[13px] font-semibold text-violet-soft"
            >
              {l}
            </span>
          ))}
        </span>
      );
    }

    const pairs = value as PairEntry[];
    return (
      <ul className="space-y-1">
        {pairs
          .filter((p) => p.name.trim())
          .map((p, i) => (
            <li key={i} className="text-ink">
              <strong className="text-white">{p.name}</strong>
              {p.why && <span className="text-ink-soft"> — {p.why}</span>}
            </li>
          ))}
      </ul>
    );
  }

  return <span className="text-ink">{String(value)}</span>;
}
