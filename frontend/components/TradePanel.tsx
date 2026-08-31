"use client";

import { FormEvent, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { cardAbi, marketAbi } from "@/lib/abi";
import { getAddresses } from "@/lib/contracts";
import { wagmiConfig } from "@/lib/wagmi";
import type { OnChainCard } from "@/lib/types";

export function TradePanel({
  card,
  onDone,
}: {
  card: OnChainCard;
  onDone: () => Promise<unknown> | unknown;
}) {
  const { address, isConnected, chainId } = useAccount();
  const { card: cardAddress, market } = getAddresses(chainId);
  const { writeContractAsync, isPending } = useWriteContract();
  const [price, setPrice] = useState(card.listed ? formatEther(card.price) : "0.05");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const isOwner = Boolean(address && card.owner.toLowerCase() === address.toLowerCase());

  const approved = useReadContract({
    address: cardAddress,
    abi: cardAbi,
    functionName: "isApprovedForAll",
    args: address && market ? [address, market] : undefined,
    query: { enabled: Boolean(isOwner && address && market) },
  });

  async function send(
    fn: () => Promise<`0x${string}`>,
    pending: string
  ) {
    setError("");
    setStatus(pending);
    try {
      const hash = await fn();
      await waitForTransactionReceipt(wagmiConfig, { hash });
      setStatus("");
      await onDone();
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  async function onApprove() {
    if (!cardAddress || !market) return;
    await send(
      () =>
        writeContractAsync({
          address: cardAddress,
          abi: cardAbi,
          functionName: "setApprovalForAll",
          args: [market, true],
        }),
      "Approving marketplace…"
    );
    await approved.refetch();
  }

  async function onList(event: FormEvent) {
    event.preventDefault();
    if (!market) return;
    const value = parseEther(price);
    await send(
      () =>
        writeContractAsync({
          address: market,
          abi: marketAbi,
          functionName: "listCard",
          args: [BigInt(card.tokenId), value],
        }),
      "Listing card…"
    );
  }

  async function onUpdate(event: FormEvent) {
    event.preventDefault();
    if (!market) return;
    await send(
      () =>
        writeContractAsync({
          address: market,
          abi: marketAbi,
          functionName: "updatePrice",
          args: [BigInt(card.tokenId), parseEther(price)],
        }),
      "Updating price…"
    );
  }

  async function onCancel() {
    if (!market) return;
    await send(
      () =>
        writeContractAsync({
          address: market,
          abi: marketAbi,
          functionName: "cancelListing",
          args: [BigInt(card.tokenId)],
        }),
      "Cancelling listing…"
    );
  }

  async function onBuy() {
    if (!market) return;
    await send(
      () =>
        writeContractAsync({
          address: market,
          abi: marketAbi,
          functionName: "buyCard",
          args: [BigInt(card.tokenId)],
          value: card.price,
        }),
      "Buying card…"
    );
  }

  if (!isConnected) {
    return <p className="mt-8 text-sm text-mist">Connect a wallet to list or buy this card.</p>;
  }

  const busy = isPending || Boolean(status);

  return (
    <section className="mt-10 max-w-md border border-[oklch(0.85_0.04_85/0.2)] bg-dusk/50 p-5">
      {error ? <p className="mb-3 text-sm text-ember">{error}</p> : null}
      {status ? <p className="mb-3 text-sm text-gold">{status}</p> : null}

      {isOwner && !card.listed ? (
        <form onSubmit={onList} className="space-y-3">
          <p className="text-sm text-mist">You hold this relic. Approve the market, then set an ask.</p>
          {!approved.data ? (
            <button type="button" disabled={busy} onClick={onApprove} className="action">
              Approve marketplace
            </button>
          ) : (
            <>
              <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                Price in ETH
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="field mt-2"
                  inputMode="decimal"
                  required
                />
              </label>
              <button type="submit" disabled={busy} className="action">
                List for sale
              </button>
            </>
          )}
        </form>
      ) : null}

      {isOwner && card.listed ? (
        <form onSubmit={onUpdate} className="space-y-3">
          <p className="text-sm text-mist">This card is listed. Change the ask or withdraw it.</p>
          <label className="block text-[0.65rem] uppercase tracking-[0.2em] text-gold">
            Price in ETH
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field mt-2"
              inputMode="decimal"
              required
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy} className="action">
              Update price
            </button>
            <button type="button" disabled={busy} onClick={onCancel} className="action-ghost">
              Cancel listing
            </button>
          </div>
        </form>
      ) : null}

      {!isOwner && card.listed ? (
        <div className="space-y-3">
          <p className="text-sm text-mist">
            Buy this relic for {formatEther(card.price)} ETH. A 2% cabinet fee stays in the market
            contract.
          </p>
          <button type="button" disabled={busy} onClick={onBuy} className="action">
            Buy for {formatEther(card.price)} ETH
          </button>
        </div>
      ) : null}

      {!isOwner && !card.listed ? (
        <p className="text-sm text-mist">Held by another collector and not currently listed.</p>
      ) : null}
    </section>
  );
}
