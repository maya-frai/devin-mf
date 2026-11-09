import {
  BookOpen, CheckCircle2, Home, KeyRound, LayoutGrid, Plug, RotateCcw, ScrollText, Shield, ShieldCheck, SlidersHorizontal, Sparkles, ToggleRight, type LucideIcon,
} from "lucide-react";

// One icon per tool and settings section, used by the sidebar and the home page.
export const ICONS: Record<string, LucideIcon> = {
  home: Home, refunds: RotateCcw, kyc: ShieldCheck, flags: ToggleRight, ledger: BookOpen, approvals: CheckCircle2, audit: ScrollText,
  compliance: Shield, data: Plug, access: KeyRound, customize: SlidersHorizontal, draft: Sparkles, overview: LayoutGrid,
};
export const iconFor = (key: string): LucideIcon => ICONS[key] ?? Sparkles;
