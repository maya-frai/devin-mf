import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Internal Tools",
  description: "Internal tools built by Devin on a small shared core",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full bg-muted/30">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
