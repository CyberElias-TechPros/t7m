'use client';

import { useState } from 'react';
import type { FieldDef, FieldOption, PairEntry, AnswerValue } from '@t7m/shared';

export interface FieldProps {
  field: FieldDef;
  value: unknown;
  error?: string;
  onChange: (value: AnswerValue) => void;
}

export function FieldRenderer(props: FieldProps) {
  const { field } = props;
  return (
    <div>
      {renderControl(props)}
      {field.helpText && !props.error && <p className="help-text" id={`${field.id}-help`}>{field.helpText}</p>}
      {props.error && <p className="error-text" role="alert" id={`${field.id}-error`}>{props.error}</p>}
    </div>
  );
}

function Label({ field, htmlFor }: { field: FieldDef; htmlFor: string }) {
  return (
    <label className="label-base mb-2.5" htmlFor={htmlFor}>
      {field.label}
      {field.required && <span className="ml-1.5 text-violet-electric" aria-hidden>*</span>}
    </label>
  );
}

function errorClass(error?: string) {
  return error ? 'input-base input-error' : 'input-base';
}

function ariaAttrs(field: FieldDef, error?: string) {
  const attrs: Record<string, string | boolean> = { 'aria-invalid': !!error };
  if (error) attrs['aria-describedby'] = `${field.id}-error`;
  else if (field.helpText) attrs['aria-describedby'] = `${field.id}-help`;
  return attrs;
}

function renderControl({ field, value, error, onChange }: FieldProps) {
  const inputId = `field-${field.id}`;
  switch (field.type) {
    case 'text':
      return (
        <div>
          <Label field={field} htmlFor={inputId} />
          <input
            id={inputId}
            type="text"
            className={errorClass(error)}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            {...ariaAttrs(field, error)}
          />
        </div>
      );
    case 'email':
      return (
        <div>
          <Label field={field} htmlFor={inputId} />
          <input
            id={inputId}
            type="email"
            autoComplete="email"
            className={errorClass(error)}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            {...ariaAttrs(field, error)}
          />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <Label field={field} htmlFor={inputId} />
          <textarea
            id={inputId}
            className={errorClass(error)}
            rows={field.rows ?? 3}
            value={(value as string) ?? ''}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            {...ariaAttrs(field, error)}
          />
        </div>
      );
    case 'choice':
      return (
        <fieldset aria-invalid={!!error}>
          <legend className="label-base mb-2.5">
            {field.label}
            {field.required && <span className="ml-1.5 text-violet-electric" aria-hidden>*</span>}
          </legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {field.options?.map((opt) => (
              <RadioCard
                key={opt.value}
                opt={opt}
                name={field.id}
                checked={value === opt.value}
                onSelect={() => onChange(opt.value)}
              />
            ))}
          </div>
        </fieldset>
      );
    case 'multichoice':
      return (
        <fieldset aria-invalid={!!error}>
          <legend className="label-base mb-2.5">
            {field.label}
            {field.required && <span className="ml-1.5 text-violet-electric" aria-hidden>*</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && (value as string[]).includes(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  aria-pressed={selected}
                  onClick={() => {
                    const current = Array.isArray(value) ? (value as string[]) : [];
                    onChange(
                      selected ? current.filter((v) => v !== opt.value) : [...current, opt.value],
                    );
                  }}
                  className={
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ' +
                    (selected
                      ? 'border-violet-bright bg-violet-bright text-white shadow-glow-sm focus:ring-violet/30'
                      : 'border-line bg-white/[0.03] text-ink-soft hover:border-violet-electric/60 hover:bg-violet/15 hover:text-white focus:ring-violet/20')
                  }
                  title={opt.hint}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      );
    case 'chips':
    case 'stringlist':
      return (
        <div>
          <Label field={field} htmlFor={`${inputId}-input`} />
          <ChipsInput
            id={`${inputId}-input`}
            value={Array.isArray(value) ? (value as string[]) : []}
            placeholder={field.placeholder ?? 'Type and press Enter'}
            onChange={onChange}
            invalid={!!error}
            describedBy={error ? `${field.id}-error` : field.helpText ? `${field.id}-help` : undefined}
          />
        </div>
      );
    case 'pairlist':
      return (
        <div>
          <Label field={field} htmlFor={`${inputId}-0-name`} />
          <PairListInput
            idPrefix={inputId}
            value={Array.isArray(value) ? (value as PairEntry[]) : []}
            placeholders={field.pairPlaceholders ?? ['Name', 'Why']}
            onChange={onChange}
          />
        </div>
      );
  }
}

function RadioCard({
  opt,
  name,
  checked,
  onSelect,
}: {
  opt: FieldOption;
  name: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={
        'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all duration-200 ' +
        (checked
          ? 'border-violet-bright bg-violet/20 ring-1 ring-violet-bright shadow-glow-sm'
          : 'border-line bg-white/[0.03] hover:border-violet-electric/50 hover:bg-violet/10')
      }
    >
      <span
        className={
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ' +
          (checked ? 'border-violet-electric bg-violet-bright' : 'border-line-strong')
        }
      >
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      <input
        type="radio"
        name={name}
        value={opt.value}
        checked={checked}
        onChange={onSelect}
        className="sr-only-ish"
      />
      <span>
        <span className="block text-[15px] font-semibold text-white">{opt.label}</span>
        {opt.hint && <span className="mt-0.5 block text-[13px] text-ink-faint">{opt.hint}</span>}
      </span>
    </label>
  );
}

function ChipsInput({
  id,
  value,
  placeholder,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  value: string[];
  placeholder: string;
  onChange: (v: AnswerValue) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [draft, setDraft] = useState('');

  function commit() {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  }

  return (
    <div
      role="group"
      className={
        'rounded-xl border bg-void-black/60 p-2.5 transition focus-within:border-violet-electric focus-within:ring-4 focus-within:ring-violet/25 ' +
        (invalid ? 'border-red-400/70' : 'border-line')
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-bright/90 px-3 py-1 text-sm font-semibold text-white shadow-glow-sm"
          >
            {chip}
            <button
              type="button"
              aria-label={`Remove ${chip}`}
              onClick={() => onChange(value.filter((v) => v !== chip))}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          className="min-w-[12rem] flex-1 bg-transparent px-2 py-1.5 text-[15px] text-ink outline-none placeholder:text-ink-faint"
          placeholder={value.length === 0 ? placeholder : 'Add another…'}
          value={draft}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && draft === '' && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
        />
      </div>
    </div>
  );
}

function PairListInput({
  idPrefix,
  value,
  placeholders,
  onChange,
}: {
  idPrefix: string;
  value: PairEntry[];
  placeholders: [string, string];
  onChange: (v: AnswerValue) => void;
}) {
  function update(i: number, patch: Partial<PairEntry>) {
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="flex items-start gap-2">
          <input
            id={`${idPrefix}-${i}-name`}
            type="text"
            className="input-base max-w-[15rem]"
            value={row.name}
            placeholder={placeholders[0]}
            aria-label={placeholders[0]}
            onChange={(e) => update(i, { name: e.target.value })}
          />
          <input
            id={`${idPrefix}-${i}-why`}
            type="text"
            className="input-base flex-1"
            value={row.why}
            placeholder={placeholders[1]}
            aria-label={placeholders[1]}
            onChange={(e) => update(i, { why: e.target.value })}
          />
          <button
            type="button"
            aria-label="Remove row"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="mt-1 rounded-lg px-3 py-2 text-sm font-semibold text-ink-faint hover:bg-white/[0.06] hover:text-red-400"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { name: '', why: '' }])}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-4 py-2 text-sm font-semibold text-violet-soft transition hover:border-violet-electric hover:text-white"
      >
        + Add a brand
      </button>
    </div>
  );
}
