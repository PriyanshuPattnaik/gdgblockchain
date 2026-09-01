import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { AppHeader } from "@/components/AppHeader";
import { MobileDock } from "@/components/MobileDock";
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
  description: "Mint, list, and buy unique celestial game cards on a blockchain testnet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <div className="relative min-h-screen pb-24 md:pb-10">
            <AppHeader />
            <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">{children}</div>
            <MobileDock />
          </div>
        </Providers>
      </body>
    </html>
  );
}
