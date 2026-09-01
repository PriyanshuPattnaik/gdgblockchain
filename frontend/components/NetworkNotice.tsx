"use client";

import { hardhat, sepolia } from "wagmi/chains";
import { useAccount, useChainId } from "wagmi";
import { getAddresses } from "@/lib/contracts";

export function NetworkNotice() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { card, market } = getAddresses(chainId);

  if (!isConnected) {
    return (
      <aside className="mb-6 rounded-md border border-[oklch(0.85_0.04_80/0.16)] bg-plank px-4 py-3 text-sm text-mute">
        Connect MetaMask on Hardhat Localhost (31337) or Sepolia to mint, list, and buy.
      </aside>
    );
  }

  if (chainId !== hardhat.id && chainId !== sepolia.id) {
    return (
      <aside className="mb-6 rounded-md border border-alert/40 bg-plank px-4 py-3 text-sm text-cream">
        Wrong network. Switch to Localhost 8545 or Sepolia.
      </aside>
    );
  }

  if (!card || !market) {
    return (
      <aside className="mb-6 rounded-md border border-alert/40 bg-plank px-4 py-3 text-sm text-cream">
        Contracts are not deployed on this chain. Keep `npm run node` running, then `npm run deploy:local`.
      </aside>
    );
  }

  return null;
}
