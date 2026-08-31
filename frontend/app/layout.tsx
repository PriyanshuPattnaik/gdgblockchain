import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Starfall Codex",
  description: "Mint, list, and trade unique celestial game cards on a blockchain testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <div className="relative mx-auto min-h-screen w-full max-w-6xl px-5 pb-24 pt-6">
            <SiteHeader />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
