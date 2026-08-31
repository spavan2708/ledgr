import type { ChangeEvent, KeyboardEvent } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  error?: string;
  type?: "text" | "number";
  prefix?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function FormField({ id, label, value, onChange, onKeyDown, error, type = "text", prefix, hint, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200" htmlFor={id}>{label}</label>
      <div className={`field-shell ${error ? "field-error" : ""}`}>
        {prefix && <span className="border-r border-white/10 px-4 text-sm font-semibold text-emerald-300">{prefix}</span>}
        <input
          {...inputProps}
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-white outline-none placeholder:text-slate-600"
        />
      </div>
      {error ? <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-300">{error}</p> : hint ? <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
