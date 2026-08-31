"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { cardAbi, marketAbi } from "@/lib/abi";
import { getAddresses } from "@/lib/contracts";
import { fetchMetadata } from "@/lib/ipfs";
import type { OnChainCard } from "@/lib/types";

export function useCatalog() {
  const chainId = useChainId();
  const addresses = getAddresses(chainId);
  const ready = Boolean(addresses.card && addresses.market);

  const totalQuery = useReadContract({
    address: addresses.card,
    abi: cardAbi,
    functionName: "totalMinted",
    query: { enabled: ready, refetchInterval: 8_000 },
  });

  const count = Number(totalQuery.data ?? BigInt(0));
  const ids = useMemo(() => Array.from({ length: count }, (_, i) => i + 1), [count]);

  const batch = useReadContracts({
    contracts: ids.flatMap((id) => [
      {
        address: addresses.card,
        abi: cardAbi,
        functionName: "ownerOf",
        args: [BigInt(id)],
      },
      {
        address: addresses.card,
        abi: cardAbi,
        functionName: "tokenURI",
        args: [BigInt(id)],
      },
      {
        address: addresses.market,
        abi: marketAbi,
        functionName: "getListing",
        args: [BigInt(id)],
      },
    ]),
    query: { enabled: ready && count > 0, refetchInterval: 8_000 },
  });

  const cards: OnChainCard[] = useMemo(() => {
    const rows = batch.data;
    if (!rows) return [];
    return ids.map((tokenId, index) => {
      const owner = rows[index * 3]?.result as `0x${string}` | undefined;
      const tokenURI = rows[index * 3 + 1]?.result as string | undefined;
      const listing = rows[index * 3 + 2]?.result as
        | readonly [`0x${string}`, bigint, boolean]
        | undefined;
      return {
        tokenId,
        owner: owner ?? "0x0000000000000000000000000000000000000000",
        tokenURI: tokenURI ?? "",
        seller: listing?.[0] ?? "0x0000000000000000000000000000000000000000",
        price: listing?.[1] ?? BigInt(0),
        listed: Boolean(listing?.[2]),
      };
    });
  }, [batch.data, ids]);

  const metadataQuery = useQuery({
    queryKey: ["starfall-metadata", chainId, cards.map((c) => c.tokenURI).join("|")],
    queryFn: async () => {
      const pairs = await Promise.all(
        cards.map(async (card) => {
          if (!card.tokenURI) return [card.tokenId, undefined] as const;
          try {
            return [card.tokenId, await fetchMetadata(card.tokenURI)] as const;
          } catch {
            return [card.tokenId, undefined] as const;
          }
        })
      );
      return Object.fromEntries(pairs);
    },
    enabled: cards.length > 0,
  });

  const hydrated = cards.map((card) => ({
    ...card,
    metadata: metadataQuery.data?.[card.tokenId],
  }));

  return {
    chainId,
    addresses,
    ready,
    cards: hydrated,
    loading: totalQuery.isLoading || (count > 0 && batch.isLoading),
    error: totalQuery.isError || batch.isError,
    refetch: async () => {
      await totalQuery.refetch();
      await batch.refetch();
      await metadataQuery.refetch();
    },
  };
}
