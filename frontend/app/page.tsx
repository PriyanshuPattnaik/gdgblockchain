"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { NetworkNotice } from "@/components/NetworkNotice";
import { MarketCard, CardSkeleton } from "@/components/MarketCard";
import { FilterBar, type MarketFilters } from "@/components/FilterBar";
import { StatStrip } from "@/components/StatStrip";
import { EmptyState } from "@/components/EmptyState";
import { useCatalog } from "@/lib/useCatalog";
import { cardName, formatEth, traitOf } from "@/lib/format";

export default function MarketPage() {
  const { cards, loading, error } = useCatalog();
  const [filters, setFilters] = useState<MarketFilters>({
    query: "",
    rarity: "",
    element: "",
    sort: "id-desc",
  });

  const listed = cards.filter((card) => card.listed);
  const floor = listed.length
    ? listed.reduce((min, card) => (card.price < min ? card.price : min), listed[0].price)
    : null;

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const rows = listed.filter((card) => {
      const rarity = String(traitOf(card.metadata, "Rarity") || "");
      const element = String(traitOf(card.metadata, "Element") || "");
      const name = cardName(card).toLowerCase();
      if (filters.rarity && rarity !== filters.rarity) return false;
      if (filters.element && element !== filters.element) return false;
      if (q && !name.includes(q) && !String(card.tokenId).includes(q)) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (filters.sort === "price-asc") return a.price < b.price ? -1 : 1;
      if (filters.sort === "price-desc") return a.price > b.price ? -1 : 1;
      return b.tokenId - a.tokenId;
    });
    return rows;
  }, [listed, filters]);

  const featured = listed.find((card) => {
    const rarity = String(traitOf(card.metadata, "Rarity") || "");
    return rarity === "Mythic" || rarity === "Legendary";
  });

  return (
    <main>
      <NetworkNotice />
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brass">Live listings</p>
          <h1 className="mt-1 font-display text-4xl text-cream md:text-5xl">The stall is open.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-mute">
            Unique ERC-721 game cards. Browse asks, inspect traits, and buy with the connected wallet.
          </p>
        </div>
        <Link href="/mint" className="btn">
          Mint a relic
        </Link>
      </section>

      <StatStrip minted={cards.length} listed={listed.length} floor={floor} />

      {featured ? (
        <Link
          href={`/card/${featured.tokenId}`}
          className="mb-10 grid overflow-hidden rounded-xl bg-plank md:grid-cols-[16rem_1fr]"
        >
          <MarketCard card={featured} compact mediaOnly />
          <div className="flex flex-col justify-center px-6 py-6">
            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-brass">Featured ask</p>
            <p className="mt-2 font-display text-3xl">{cardName(featured)}</p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-mute">
              {featured.metadata?.description}
            </p>
            <p className="mt-4 text-xl text-brass">{formatEth(featured.price)} ETH</p>
          </div>
        </Link>
      ) : null}

      <FilterBar value={filters} onChange={setFilters} listedCount={visible.length} />

      {error ? (
        <EmptyState
          title="Chain is quiet"
          body="Could not read the local node. Keep npm run node running, deploy if needed, then refresh."
        />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="No cards on the table"
          body="Mint a relic, approve the market, and set an ask from Inventory. Listed cards show up here."
          actionHref="/mint"
          actionLabel="Create the first card"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((card) => (
            <MarketCard key={card.tokenId} card={card} href={`/card/${card.tokenId}`} />
          ))}
        </div>
      )}
    </main>
  );
}
