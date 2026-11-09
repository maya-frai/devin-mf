// Mock KYC/AML vendor connector (sanctions, PEP and document checks).
// TODO: swap for the real vendor SDK; keep the same function signatures.
export type ScreeningResult = {
  provider: "MockKYC";
  sanctionsHit: boolean;
  pepHit: boolean;
  score: number;
};

function hash(s: string): number {
  return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7);
}

export async function runScreening(input: {
  name: string;
  country: string;
}): Promise<ScreeningResult> {
  const h = hash(`${input.name}|${input.country}`);
  return {
    provider: "MockKYC",
    sanctionsHit: h % 11 === 0,
    pepHit: h % 7 === 0,
    score: h % 100,
  };
}
