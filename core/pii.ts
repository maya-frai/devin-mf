// Field-level security: PII is masked by default. Reveal goes through revealPii() in core/actions.ts,
// which only ops_analyst (business operations, who reviews KYC) can use and which writes an audit entry.
export type PiiField = "ssn" | "dob";

export function mask(field: PiiField, value: string): string {
  return field === "ssn" ? `***-**-${value.slice(-4)}` : `${value.slice(0, 4)}-**-**`;
}
