"use client";

import { useParams } from "next/navigation";
import { formatEther } from "viem";
import { RelicCard } from "@/components/RelicCard";
import { NetworkNotice } from "@/components/NetworkNotice";
import { TradePanel } from "@/components/TradePanel";
import { useCatalog } from "@/lib/useCatalog";
import { traitValue } from "@/lib/types";

export default function CardPage() {
  const params = useParams<{ id: string }>();
  const tokenId = Number(params.id);
  const { cards, loading, refetch } = useCatalog();
  const card = cards.find((item) => item.tokenId === tokenId);

  return (
    <main>
      <NetworkNotice />
      {loading && !card ? (
        <p className="text-mist">Reading the chain…</p>
      ) : !card ? (
        <p className="text-mist">No card with token ID {tokenId} on this network.</p>
      ) : (
        <div className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
          <RelicCard card={card} />
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold">
              {traitValue(card.metadata, "Rarity") || "Uncatalogued"} · Token {card.tokenId}
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-light">
              {card.metadata?.name ?? `Relic #${card.tokenId}`}
            </h2>
            <p className="mt-4 max-w-prose text-mist leading-7">
              {card.metadata?.description || "Metadata could not be loaded from the token URI."}
            </p>
            <dl className="mt-8 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {(card.metadata?.attributes ?? []).map((trait) => (
                <div key={trait.trait_type}>
                  <dt className="uppercase tracking-[0.18em] text-[0.65rem] text-gold">
                    {trait.trait_type}
                  </dt>
                  <dd className="mt-1 text-paper">{String(trait.value)}</dd>
                </div>
              ))}
              <div>
                <dt className="uppercase tracking-[0.18em] text-[0.65rem] text-gold">Owner</dt>
                <dd className="mt-1 break-all text-paper">{card.owner}</dd>
              </div>
              {card.listed ? (
                <div>
                  <dt className="uppercase tracking-[0.18em] text-[0.65rem] text-gold">Ask</dt>
                  <dd className="mt-1 text-paper">{formatEther(card.price)} ETH</dd>
                </div>
              ) : null}
            </dl>
            <TradePanel card={card} onDone={refetch} />
          </div>
        </div>
      )}
    </main>
  );
}
