import type { Address } from "viem";
import deployed from "./deployed.json";

type DeployMap = Record<string, { card: string; market: string }>;

export function getAddresses(chainId: number | undefined): {
  card?: Address;
  market?: Address;
} {
  if (process.env.NEXT_PUBLIC_CARD_ADDRESS && process.env.NEXT_PUBLIC_MARKET_ADDRESS) {
    return {
      card: process.env.NEXT_PUBLIC_CARD_ADDRESS as Address,
      market: process.env.NEXT_PUBLIC_MARKET_ADDRESS as Address,
    };
  }
  if (!chainId) return {};
  const row = (deployed as DeployMap)[String(chainId)];
  if (!row?.card || !row?.market) return {};
  return {
    card: row.card as Address,
    market: row.market as Address,
  };
}
