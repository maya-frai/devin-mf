const input = "h-8 rounded-lg border bg-background px-2 text-sm";

export function SelectField(props: { name: string; label: string; options: { value: string; label: string }[] }) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {props.label}
      <select name={props.name} required className={input}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ReasonField() {
  return (
    <label className="grid flex-1 gap-1 text-xs text-muted-foreground">
      Reason
      <input name="reason" required placeholder="Why?" className={`${input} min-w-64`} />
    </label>
  );
}
