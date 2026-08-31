"use client";

import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

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
          className="action"
          disabled={isPending || !injected}
          onClick={() => injected && connect({ connector: injected })}
        >
          {isPending ? "Connecting…" : "Connect wallet"}
        </button>
        {error ? <p className="max-w-xs text-right text-xs text-ember">{error.message}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
      {!supported ? (
        <button
          type="button"
          className="action"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: hardhat.id })}
        >
          Switch to Localhost
        </button>
      ) : (
        <span className="text-xs uppercase tracking-[0.18em] text-gold">
          {chainId === hardhat.id ? "Localhost" : "Sepolia"}
        </span>
      )}
      <span className="text-paper">{short(address)}</span>
      <button type="button" className="action-ghost" onClick={() => disconnect()}>
        Disconnect
      </button>
    </div>
  );
}
