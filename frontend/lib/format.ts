import { formatEther } from "viem";
import type { CardMetadata, OnChainCard } from "./types";

export function shortAddr(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatEth(value: bigint) {
  const asNumber = Number(formatEther(value));
  if (!Number.isFinite(asNumber)) return formatEther(value);
  if (asNumber >= 1) return asNumber.toFixed(3).replace(/\.?0+$/, "");
  return asNumber.toFixed(4).replace(/\.?0+$/, "");
}

export function cardName(card: OnChainCard) {
  return card.metadata?.name ?? `Relic #${card.tokenId}`;
}

export function traitOf(meta: CardMetadata | undefined, trait: string) {
  return meta?.attributes.find((item) => item.trait_type === trait)?.value;
}
