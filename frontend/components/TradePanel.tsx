"use client";

import { FormEvent, useState } from "react";
import { parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { cardAbi, marketAbi } from "@/lib/abi";
import { getAddresses } from "@/lib/contracts";
import { formatEth } from "@/lib/format";
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
  const [price, setPrice] = useState(card.listed ? formatEth(card.price) : "0.05");
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

  async function send(fn: () => Promise<`0x${string}`>, pending: string) {
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
      "Approving marketplace"
    );
    await approved.refetch();
  }

  async function onList(event: FormEvent) {
    event.preventDefault();
    if (!market) return;
    await send(
      () =>
        writeContractAsync({
          address: market,
          abi: marketAbi,
          functionName: "listCard",
          args: [BigInt(card.tokenId), parseEther(price)],
        }),
      "Listing card"
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
      "Updating price"
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
      "Cancelling listing"
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
      "Buying card"
    );
  }

  const busy = isPending || Boolean(status);

  return (
    <section className="rounded-xl border border-[oklch(0.85_0.04_80/0.16)] bg-plank p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-mute">Order box</p>
      {card.listed ? (
        <p className="mt-2 font-display text-4xl text-brass">{formatEth(card.price)} ETH</p>
      ) : (
        <p className="mt-2 font-display text-3xl text-mute">Not for sale</p>
      )}
      <p className="mt-1 text-xs text-mute">Market takes 2% on a successful buy.</p>

      {error ? <p className="mt-3 text-sm text-alert">{error}</p> : null}
      {status ? <p className="mt-3 text-sm text-brass">{status}</p> : null}

      {!isConnected ? (
        <p className="mt-5 text-sm text-mute">Connect a wallet to buy or list.</p>
      ) : null}

      {isOwner && !card.listed ? (
        <form onSubmit={onList} className="mt-5 space-y-3">
          {!approved.data ? (
            <button type="button" disabled={busy} onClick={onApprove} className="btn w-full">
              Approve marketplace
            </button>
          ) : (
            <>
              <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-mute">
                Ask price (ETH)
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="field mt-2"
                  inputMode="decimal"
                  required
                />
              </label>
              <button type="submit" disabled={busy} className="btn w-full">
                List for sale
              </button>
            </>
          )}
        </form>
      ) : null}

      {isOwner && card.listed ? (
        <form onSubmit={onUpdate} className="mt-5 space-y-3">
          <label className="block text-[0.65rem] uppercase tracking-[0.16em] text-mute">
            Ask price (ETH)
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field mt-2"
              inputMode="decimal"
              required
            />
          </label>
          <button type="submit" disabled={busy} className="btn w-full">
            Update price
          </button>
          <button type="button" disabled={busy} onClick={onCancel} className="btn-ghost w-full">
            Delist
          </button>
        </form>
      ) : null}

      {!isOwner && card.listed ? (
        <button type="button" disabled={busy || !isConnected} onClick={onBuy} className="btn mt-5 w-full">
          Buy now
        </button>
      ) : null}

      {!isOwner && !card.listed && isConnected ? (
        <p className="mt-5 text-sm text-mute">This card is in another wallet and has no ask.</p>
      ) : null}
    </section>
  );
}
