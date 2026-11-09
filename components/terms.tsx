"use client";

import { createContext, useContext, type ReactNode } from "react";
import { TERMINOLOGY, type Terms } from "@/config/terminology";

const TermsContext = createContext<Terms>(TERMINOLOGY.default);

export function TermsProvider({ terms, children }: { terms: Terms; children: ReactNode }) {
  return <TermsContext.Provider value={terms}>{children}</TermsContext.Provider>;
}

export const useTerms = () => useContext(TermsContext);
