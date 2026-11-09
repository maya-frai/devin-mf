// PII is masked by default. Revealing goes through revealPii(), which audits.
export const MASKABLE_FIELDS = ["ssn", "dob"] as const;
export type MaskableField = (typeof MASKABLE_FIELDS)[number];

export function maskSsn(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`;
}

export function maskDob(): string {
  return "****-**-**";
}

export function mask(field: MaskableField, value: string): string {
  return field === "ssn" ? maskSsn(value) : maskDob();
}
