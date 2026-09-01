"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";

const links = [
  { href: "/", label: "Market" },
  { href: "/mint", label: "Create" },
  { href: "/collection", label: "Inventory" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[oklch(0.85_0.04_80/0.12)] bg-void">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-brass">Starfall Codex</p>
          <p className="font-display text-lg leading-tight text-cream">Card market</p>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm ${active ? "bg-plank text-brass" : "text-mute hover:text-cream"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/mint" className="btn hidden sm:inline-flex">
            Create card
          </Link>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
