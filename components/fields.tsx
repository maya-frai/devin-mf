import type { ChangeEvent, ReactNode } from "react";

// Form fields with inline validation: the message appears once the user has touched an invalid field.
const input = "peer h-8 w-full rounded-lg border bg-background px-2 text-sm user-invalid:border-destructive";
const label = "grid gap-1 text-xs text-muted-foreground";
const error = "hidden text-xs text-destructive peer-user-invalid:block";

type Option = { value: string; label: string };

export function SelectField(props: {
  name: string;
  label: string;
  options: Option[];
  value?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className={label}>
      {props.label}
      <select name={props.name} required value={props.value} onChange={props.onChange} defaultValue={props.value === undefined && props.placeholder ? "" : undefined} className={input}>
        {props.placeholder ? <option value="" disabled>{props.placeholder}</option> : null}
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className={error}>Choose one</span>
    </label>
  );
}

export function NumberField(props: {
  name: string;
  label: string;
  min: number;
  max?: number;
  step?: number;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  rangeText: string;
}) {
  return (
    <label className={label}>
      {props.label}
      <input name={props.name} type="number" required min={props.min} max={props.max} step={props.step ?? 0.01} value={props.value} onChange={props.onChange} className={input} />
      <span className={error}>{props.rangeText}</span>
    </label>
  );
}

export function ReasonField({ label: text = "Reason" }: { label?: string }) {
  return (
    <label className={`${label} min-w-64 flex-1`}>
      {text}
      <input name="reason" required placeholder="Why?" className={input} />
      <span className={error}>A reason is required</span>
    </label>
  );
}

export function NotesField() {
  return (
    <label className={label}>
      Notes (optional)
      <textarea name="notes" rows={2} className="rounded-lg border bg-background px-2 py-1 text-sm" />
    </label>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-3">{children}</div>;
}
