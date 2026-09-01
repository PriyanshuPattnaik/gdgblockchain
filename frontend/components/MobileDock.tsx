"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Market" },
  { href: "/mint", label: "Create" },
  { href: "/collection", label: "Inventory" },
];

export function MobileDock() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-[oklch(0.85_0.04_80/0.14)] bg-void px-2 py-2 md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md py-2 text-center text-xs tracking-[0.14em] uppercase ${active ? "text-brass" : "text-mute"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
