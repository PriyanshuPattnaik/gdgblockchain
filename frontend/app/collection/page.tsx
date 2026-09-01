"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { NetworkNotice } from "@/components/NetworkNotice";
import { MarketCard, CardSkeleton } from "@/components/MarketCard";
import { EmptyState } from "@/components/EmptyState";
import { useCatalog } from "@/lib/useCatalog";

type Tab = "all" | "listed" | "held";

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const { cards, loading, error } = useCatalog();
  const [tab, setTab] = useState<Tab>("all");

  const mine = cards.filter(
    (card) => address && card.owner.toLowerCase() === address.toLowerCase()
  );
  const visible = useMemo(() => {
    if (tab === "listed") return mine.filter((card) => card.listed);
    if (tab === "held") return mine.filter((card) => !card.listed);
    return mine;
  }, [mine, tab]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "all", label: "All", count: mine.length },
    { id: "listed", label: "Listed", count: mine.filter((c) => c.listed).length },
    { id: "held", label: "In wallet", count: mine.filter((c) => !c.listed).length },
  ];

  return (
    <main>
      <NetworkNotice />
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brass">Inventory</p>
      <h1 className="mt-1 font-display text-4xl text-cream">Your stall</h1>
      <p className="mt-3 mb-6 max-w-xl text-sm leading-6 text-mute">
        Cards whose on-chain owner matches this wallet. Open one to list, change the ask, or delist.
      </p>

      {!isConnected ? (
        <EmptyState title="Wallet closed" body="Connect MetaMask to see relics you own." />
      ) : error ? (
        <EmptyState title="Chain is quiet" body="Could not read the node. Is npm run node still running?" />
      ) : (
        <>
          <div className="mb-6 flex gap-2">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`rounded-full px-3 py-1.5 text-sm ${tab === item.id ? "bg-brass text-void" : "bg-plank text-mute"}`}
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={tab === "listed" ? "Nothing listed" : "Empty binder"}
              body={
                tab === "listed"
                  ? "Open a card you own and set an ask. It will appear on the market."
                  : "Mint a relic to start your binder."
              }
              actionHref="/mint"
              actionLabel="Create a card"
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((card) => (
                <MarketCard key={card.tokenId} card={card} href={`/card/${card.tokenId}`} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
