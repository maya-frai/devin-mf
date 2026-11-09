// PII is masked by default. Revealing goes through revealPii() in core/actions.ts.
export type PiiField = "ssn" | "dob";

export function mask(field: PiiField, value: string): string {
  return field === "ssn" ? `***-**-${value.slice(-4)}` : "****-**-**";
}
