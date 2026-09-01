import Link from "next/link";
import { toHttpUri } from "@/lib/ipfs";
import { cardName, formatEth, traitOf } from "@/lib/format";
import type { OnChainCard } from "@/lib/types";

const foil: Record<string, string> = {
  Common: "foil-common",
  Rare: "foil-rare",
  Epic: "foil-epic",
  Legendary: "foil-legendary",
  Mythic: "foil-mythic",
};

export function MarketCard({
  card,
  href,
  compact = false,
  mediaOnly = false,
}: {
  card: OnChainCard;
  href?: string;
  compact?: boolean;
  mediaOnly?: boolean;
}) {
  const rarity = String(traitOf(card.metadata, "Rarity") || "Common");
  const element = String(traitOf(card.metadata, "Element") || "");
  const name = cardName(card);
  const image = card.metadata?.image ? toHttpUri(card.metadata.image) : "";

  const inner = (
    <article className={`market-card overflow-hidden rounded-xl bg-plank ${foil[rarity] ?? "foil-common"}`}>
      <div className={`relative bg-tray ${compact ? "aspect-[4/5]" : "aspect-[5/7]"}`}>
        {image ? (
          // NFT art comes from IPFS or local /api/meta URLs.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="skel h-full w-full" />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <span className="chip">{rarity}</span>
        </div>
        {card.listed ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-void/90 px-2 py-1 text-xs font-semibold text-brass">
            {formatEth(card.price)} ETH
          </span>
        ) : (
          <span className="absolute bottom-2 right-2 rounded-md bg-void/90 px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-mute">
            Unlisted
          </span>
        )}
      </div>
      {mediaOnly ? null : (
      <div className="space-y-1 px-3 py-3">
        <p className="font-display text-lg leading-tight text-cream">{name}</p>
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-mute">
          #{card.tokenId}
          {element ? ` · ${element}` : ""}
        </p>
      </div>
      )}
    </article>
  );

  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-plank">
      <div className="skel aspect-[5/7]" />
      <div className="space-y-2 p-3">
        <div className="skel h-5 w-3/4 rounded" />
        <div className="skel h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
