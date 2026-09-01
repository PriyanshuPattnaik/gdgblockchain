"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { NetworkNotice } from "@/components/NetworkNotice";
import { MarketCard } from "@/components/MarketCard";
import { TradePanel } from "@/components/TradePanel";
import { EmptyState } from "@/components/EmptyState";
import { useCatalog } from "@/lib/useCatalog";
import { cardName, shortAddr } from "@/lib/format";

export default function CardPage() {
  const params = useParams<{ id: string }>();
  const tokenId = Number(params.id);
  const { cards, loading, refetch } = useCatalog();
  const card = cards.find((item) => item.tokenId === tokenId);

  return (
    <main>
      <NetworkNotice />
      <p className="mb-6 text-sm text-mute">
        <Link href="/" className="hover:text-brass">
          Market
        </Link>
        <span> / </span>
        <span>Token {tokenId}</span>
      </p>

      {loading && !card ? (
        <p className="text-mute">Loading listing…</p>
      ) : !card ? (
        <EmptyState
          title="No such relic"
          body={`Token ${tokenId} is not on this network. Mint first, or switch chain.`}
          actionHref="/"
          actionLabel="Back to market"
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_18rem]">
          <MarketCard card={card} />
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-brass">
              Token {card.tokenId}
            </p>
            <h1 className="mt-2 font-display text-4xl text-cream">{cardName(card)}</h1>
            <p className="mt-4 max-w-prose text-sm leading-7 text-mute">
              {card.metadata?.description || "Metadata could not be loaded from the token URI."}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-3">
              {(card.metadata?.attributes ?? []).map((trait) => (
                <div key={trait.trait_type} className="rounded-lg bg-plank px-3 py-3">
                  <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-mute">
                    {trait.trait_type}
                  </dt>
                  <dd className="mt-1 text-cream">{String(trait.value)}</dd>
                </div>
              ))}
              <div className="rounded-lg bg-plank px-3 py-3">
                <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-mute">Owner</dt>
                <dd className="mt-1 font-mono text-sm text-cream">{shortAddr(card.owner)}</dd>
              </div>
            </dl>
          </div>
          <div className="lg:sticky lg:top-24 h-fit">
            <TradePanel card={card} onDone={refetch} />
          </div>
        </div>
      )}
    </main>
  );
}
