"use client";

import { RelicCard } from "@/components/RelicCard";
import { NetworkNotice } from "@/components/NetworkNotice";
import { useCatalog } from "@/lib/useCatalog";

export default function CabinetPage() {
  const { cards, loading, error } = useCatalog();
  const listed = cards.filter((card) => card.listed);
  const featured = listed.find((card) => {
    const rarity = card.metadata?.attributes.find((a) => a.trait_type === "Rarity")?.value;
    return rarity === "Mythic" || rarity === "Legendary";
  }) ?? listed[0];
  const rest = listed.filter((card) => card.tokenId !== featured?.tokenId);

  return (
    <main>
      <NetworkNotice />
      <section className="mb-14 max-w-2xl">
        <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold">Open cabinet</p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-light leading-tight md:text-6xl">
          Cards bound to collapsed stars.
        </h2>
        <p className="mt-5 max-w-prose text-mist leading-7">
          Each relic is an ERC-721 with its own token ID. Art and traits live on IPFS; price and
          ownership live on-chain. Browse listings, or inscribe a card of your own.
        </p>
      </section>

      {error ? (
        <p className="text-ember">
          Could not read the local chain. Keep `npm run node` running, then refresh.
        </p>
      ) : loading ? (
        <p className="text-mist">Reading the chain…</p>
      ) : listed.length === 0 ? (
        <p className="max-w-md text-mist">
          Nothing is listed yet. Mint a card, approve the market, and set a price from My relics.
        </p>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {featured ? (
            <div>
              <p className="mb-3 text-[0.7rem] uppercase tracking-[0.28em] text-gold">Lead listing</p>
              <RelicCard card={featured} href={`/card/${featured.tokenId}`} />
            </div>
          ) : null}
          <div className="space-y-6">
            {rest.map((card) => (
              <div
                key={card.tokenId}
                className="grid grid-cols-[7rem_1fr] items-stretch gap-4 border-t border-[oklch(0.85_0.04_85/0.16)] pt-5"
              >
                <RelicCard card={card} href={`/card/${card.tokenId}`} />
                <div className="flex flex-col justify-end pb-2">
                  <p className="font-[family-name:var(--font-display)] text-2xl">
                    {card.metadata?.name ?? `Relic #${card.tokenId}`}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-mist">
                    {card.metadata?.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
