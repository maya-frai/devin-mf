export type Role = "ops_analyst" | "ops_lead" | "kyc_reviewer" | "eng_admin" | "finance";

export type User = { id: string; name: string; role: Role };

// Fake sign-in for the PoC. TODO: replace with the company IdP (Entra ID / Okta).
export const USERS: User[] = [
  { id: "ana", name: "Ana", role: "ops_analyst" },
  { id: "luis", name: "Luis", role: "ops_lead" },
  { id: "kim", name: "Kim", role: "kyc_reviewer" },
  { id: "eli", name: "Eli", role: "eng_admin" },
  { id: "farah", name: "Farah", role: "finance" },
];

export function getUser(id: string | undefined): User | undefined {
  return USERS.find((u) => u.id === id);
}

export const userIdByName = (name: string): string | undefined => USERS.find((u) => u.name === name)?.id;
