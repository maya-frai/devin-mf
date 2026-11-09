import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { Sidebar } from "@/components/sidebar";
import { TermsProvider } from "@/components/terms";
import { Toaster } from "@/components/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { brandStyle } from "@/config/brand";
import { TERMINOLOGY } from "@/config/terminology";
import { getCurrentBrand } from "@/core/session";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  return { title: `${brand.name} internal tools`, description: "Internal tools built by Devin on a small shared core" };
}

// The brand (config/brand.ts) is applied as CSS variables, so every component picks it up.
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const brand = await getCurrentBrand();
  return (
    <html lang="en" data-density={brand.density} style={brandStyle(brand) as CSSProperties}
      className={`${geist.variable} ${plex.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full bg-background font-sans text-foreground">
        <TermsProvider terms={TERMINOLOGY[brand.terminology]}>
          <TooltipProvider>
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <AppHeader />
              <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">{children}</main>
            </div>
            <Toaster />
          </TooltipProvider>
        </TermsProvider>
      </body>
    </html>
  );
}
