export type Role = "ops_analyst" | "ops_lead" | "product_manager" | "eng_admin" | "finance";

export type User = { id: string; name: string; role: Role };

// Fake sign-in for the PoC. TODO: replace with the company IdP (Entra ID / Okta).
export const USERS: User[] = [
  { id: "eli", name: "Eli", role: "eng_admin" },
  { id: "sam", name: "Sam", role: "eng_admin" },
  { id: "farah", name: "Farah", role: "finance" },
  { id: "omar", name: "Omar", role: "finance" },
  { id: "ana", name: "Ana", role: "ops_analyst" },
  { id: "jordan", name: "Jordan", role: "ops_analyst" },
  { id: "priya", name: "Priya", role: "product_manager" },
  { id: "leo", name: "Leo", role: "product_manager" },
  { id: "luis", name: "Luis", role: "ops_lead" },
  { id: "maria", name: "Maria", role: "ops_lead" },
];

export function getUser(id: string | undefined): User | undefined {
  return USERS.find((u) => u.id === id);
}

export const userIdByName = (name: string): string | undefined => USERS.find((u) => u.name === name)?.id;
