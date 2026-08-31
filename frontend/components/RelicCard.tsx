import Link from "next/link";
import { formatEther } from "viem";
import { toHttpUri } from "@/lib/ipfs";
import { traitValue, type OnChainCard } from "@/lib/types";

const foil: Record<string, string> = {
  Common: "foil-common",
  Rare: "foil-rare",
  Epic: "foil-epic",
  Legendary: "foil-legendary",
  Mythic: "foil-mythic",
};

export function RelicCard({
  card,
  href,
}: {
  card: OnChainCard;
  href?: string;
}) {
  const rarity = traitValue(card.metadata, "Rarity") || "Common";
  const name = card.metadata?.name ?? `Relic #${card.tokenId}`;
  const image = card.metadata?.image ? toHttpUri(card.metadata.image) : "";
  const inner = (
    <article className={`overflow-hidden rounded-[1.4rem] bg-dusk ${foil[rarity] ?? "foil-common"}`}>
      <div className="relative aspect-[5/7] bg-night">
        {image ? (
          // NFT URIs come from IPFS / data URIs; a plain img is more reliable than next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end p-5 text-sm text-mist">Loading inscription…</div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-night/80 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold">
          {rarity}
        </span>
      </div>
      <div className="space-y-1 px-4 py-4">
        <p className="font-[family-name:var(--font-display)] text-xl leading-tight">{name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-mist">Token {card.tokenId}</p>
        {card.listed ? (
          <p className="pt-2 text-sm text-gold">{formatEther(card.price)} ETH</p>
        ) : (
          <p className="pt-2 text-sm text-mist">Held, not listed</p>
        )}
      </div>
    </article>
  );

  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
