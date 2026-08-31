"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";

const links = [
  { href: "/", label: "Cabinet" },
  { href: "/mint", label: "Inscribe" },
  { href: "/collection", label: "My relics" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-[oklch(0.85_0.04_85/0.18)] pb-6">
      <Link href="/" className="block">
        <p className="text-[0.7rem] uppercase tracking-[0.34em] text-gold">Starfall Codex</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-light tracking-tight text-paper md:text-4xl">
          Relic market
        </h1>
      </Link>
      <nav className="flex flex-wrap items-center gap-5 text-sm text-mist">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "text-gold" : "hover:text-paper"}
            >
              {link.label}
            </Link>
          );
        })}
        <WalletButton />
      </nav>
    </header>
  );
}
