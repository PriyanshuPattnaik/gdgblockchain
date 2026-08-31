"use client";

import { useAccount } from "wagmi";
import { RelicCard } from "@/components/RelicCard";
import { NetworkNotice } from "@/components/NetworkNotice";
import { useCatalog } from "@/lib/useCatalog";

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { cards, loading, error } = useCatalog();
  const mine = cards.filter(
    (card) => address && card.owner.toLowerCase() === address.toLowerCase()
  );

  return (
    <main>
      <NetworkNotice />
      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold">Held relics</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-light">
        Cards in this wallet
      </h2>
      <p className="mt-4 mb-10 max-w-prose text-mist leading-7">
        Only tokens whose `ownerOf` matches the connected address appear here. Open a card to list
        it or pull it from the cabinet.
      </p>
      {!isConnected ? (
        <p className="text-mist">Connect a wallet to see your collection.</p>
      ) : error ? (
        <p className="text-ember">Could not read the chain. Is the local node running?</p>
      ) : loading ? (
        <p className="text-mist">Reading the chain…</p>
      ) : mine.length === 0 ? (
        <p className="text-mist">This wallet does not hold any Starfall cards yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((card) => (
            <RelicCard key={card.tokenId} card={card} href={`/card/${card.tokenId}`} />
          ))}
        </div>
      )}
    </main>
  );
}
