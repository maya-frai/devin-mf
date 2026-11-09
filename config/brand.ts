// Brand as config. Every color, name, font, radius and density in the UI comes from here.
export type Brand = {
  id: string;
  name: string;
  logo: string; // file in /public/brand
  terminology: "default" | "alt"; // see config/terminology.ts
  font: "geist" | "plex";
  radius: string;
  density: "comfortable" | "compact";
  colors: { primary: string; primaryForeground: string; accent: string; accentForeground: string; success: string; warning: string; destructive: string };
  neutral: { background: string; foreground: string; card: string; muted: string; mutedForeground: string; border: string };
};

export const BRANDS: Brand[] = [
  {
    id: "ledgerline",
    name: "Ledgerline",
    logo: "/brand/ledgerline.svg",
    terminology: "default",
    font: "geist",
    radius: "0.625rem",
    density: "comfortable",
    colors: { primary: "#0b5d4b", primaryForeground: "#ffffff", accent: "#e3f1ec", accentForeground: "#0b5d4b", success: "#15803d", warning: "#b45309", destructive: "#c2410c" },
    neutral: { background: "#f6f8f7", foreground: "#0f1a17", card: "#ffffff", muted: "#edf1ef", mutedForeground: "#5b6b66", border: "#dbe3df" },
  },
  {
    id: "ledgerline-alt",
    name: "Ledgerline (alt)",
    logo: "/brand/ledgerline-alt.svg",
    terminology: "alt",
    font: "plex",
    radius: "0.25rem",
    density: "compact",
    colors: { primary: "#4338ca", primaryForeground: "#ffffff", accent: "#eceefe", accentForeground: "#3730a3", success: "#047857", warning: "#c2410c", destructive: "#be123c" },
    neutral: { background: "#fafaf7", foreground: "#1c1917", card: "#ffffff", muted: "#f2f1ec", mutedForeground: "#6b665e", border: "#e5e2da" },
  },
];

export const getBrand = (id?: string): Brand => BRANDS.find((b) => b.id === id) ?? BRANDS[0];

// CSS variables read by globals.css and the Tailwind theme.
export function brandStyle(b: Brand): Record<string, string> {
  const { colors: c, neutral: n } = b;
  return {
    "--primary": c.primary, "--primary-foreground": c.primaryForeground, "--ring": c.primary, "--chart-1": c.primary,
    "--accent": c.accent, "--accent-foreground": c.accentForeground,
    "--success": c.success, "--warning": c.warning, "--destructive": c.destructive,
    "--background": n.background, "--foreground": n.foreground,
    "--card": n.card, "--card-foreground": n.foreground, "--popover": n.card, "--popover-foreground": n.foreground,
    "--muted": n.muted, "--muted-foreground": n.mutedForeground, "--secondary": n.muted, "--secondary-foreground": n.foreground,
    "--border": n.border, "--input": n.border, "--sidebar": n.card,
    "--radius": b.radius, "--font-sans": `var(--font-${b.font})`,
  };
}
