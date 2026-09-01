"use client";

import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { shortAddr } from "@/lib/format";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const injected = connectors[0];
  const supported = chainId === hardhat.id || chainId === sepolia.id;

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          className="btn"
          disabled={isPending || !injected}
          onClick={() => injected && connect({ connector: injected })}
        >
          {isPending ? "Connecting" : "Connect"}
        </button>
        {error ? <p className="max-w-[14rem] text-right text-[0.7rem] text-alert">{error.message}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!supported ? (
        <button
          type="button"
          className="btn"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: hardhat.id })}
        >
          Switch network
        </button>
      ) : (
        <span className="hidden rounded-full bg-plank px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-brass sm:inline">
          {chainId === hardhat.id ? "Localhost" : "Sepolia"}
        </span>
      )}
      <span className="hidden font-mono text-xs text-cream sm:inline">{shortAddr(address)}</span>
      <button type="button" className="btn-ghost" onClick={() => disconnect()}>
        Out
      </button>
    </div>
  );
}
