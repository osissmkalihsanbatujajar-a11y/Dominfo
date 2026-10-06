import { useState, type FormEvent } from 'react';
import type { ZodTypeAny } from 'zod';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { toMessage } from '@/services/errors';
import { cn } from '@/lib/utils';
import type { Option } from '@/types';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'date' | 'url' | 'email' | 'checkbox';
  options?: Option[];
  /** Untuk select: teks opsi kosong. Tanpa ini, select tidak punya opsi kosong. */
  emptyLabel?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  span?: 1 | 2;
}

type Values = Record<string, string | boolean>;

interface Props {
  id: string;
  fields: FieldDef[];
  schema: ZodTypeAny;
  initial: Values;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

/** Bangun nilai awal formulir dari sebuah record (null -> ''), dengan nilai bawaan. */
export function buildInitial(fields: FieldDef[], source: Record<string, unknown> = {}): Values {
  const out: Values = {};
  for (const f of fields) {
    const v = source[f.name];
    if (f.type === 'checkbox') out[f.name] = Boolean(v);
    else out[f.name] = v === null || v === undefined ? '' : String(v);
  }
  return out;
}

/** Formulir generik berbasis konfigurasi field + validasi zod + pesan error per field. */
export function EntityForm({ id, fields, schema, initial, submitLabel, onSubmit, onCancel }: Props) {
  const toast = useToast();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (name: string, v: string | boolean) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const raw: Record<string, unknown> = {};
    for (const f of fields) {
      const v = values[f.name];
      raw[f.name] = typeof v === 'string' ? v.trim() : v;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? '_');
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      toast.warning('Periksa kembali isian formulir.');
      const first = fields.find((f) => errs[f.name]);
      if (first) document.getElementById(`${id}-${first.name}`)?.focus();
      return;
    }
    const out = Object.fromEntries(
      Object.entries(parsed.data as Record<string, unknown>).map(([k, v]) => [k, v === '' ? null : v]),
    );
    setSaving(true);
    try {
      await onSubmit(out);
    } catch (err) {
      toast.error(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id: fid,
          'aria-invalid': err ? true : undefined,
          'aria-describedby': err ? `${fid}-error` : undefined,
        } as const;
        const span = f.span === 2 || f.type === 'textarea' || f.type === 'checkbox' ? 'sm:col-span-2' : '';

        if (f.type === 'checkbox') {
          return (
            <label key={f.name} htmlFor={fid} className={cn('flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-inset ring-white/10', span)}>
              <input id={fid} type="checkbox" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} className="h-5 w-5 rounded border-white/20 bg-ink-900 accent-iris-500" />
              <span className="text-sm text-ink-200">
                {f.label}
                {f.hint && <span className="block text-xs text-ink-400">{f.hint}</span>}
              </span>
            </label>
          );
        }
        return (
          <Field key={f.name} label={f.label} htmlFor={fid} error={err} hint={f.hint} required={f.required} className={span}>
            {f.type === 'textarea' ? (
              <Textarea {...common} value={String(values[f.name])} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <Select {...common} value={String(values[f.name])} options={f.options ?? []} placeholder={f.emptyLabel} onChange={(e) => set(f.name, e.target.value)} />
            ) : (
              <Input
                {...common}
                type={f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : f.type === 'email' ? 'email' : 'text'}
                inputMode={f.type === 'url' ? 'url' : undefined}
                value={String(values[f.name])}
                placeholder={f.placeholder}
                onChange={(e) => set(f.name, e.target.value)}
              />
            )}
          </Field>
        );
      })}

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-1 flex flex-col-reverse gap-2 border-t border-white/10 bg-ink-850/95 px-5 py-4 backdrop-blur sm:col-span-2 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} disabled={saving}>Batal</Button>
        <Button type="submit" variant="primary" loading={saving}>{submitLabel}</Button>
      </div>
    </form>
  );
}
