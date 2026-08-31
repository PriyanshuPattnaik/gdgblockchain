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
      <aside className="mb-10 max-w-xl border border-[oklch(0.85_0.04_85/0.2)] bg-dusk/70 px-5 py-4 text-sm leading-relaxed text-mist">
        Connect a wallet on Hardhat Localhost (chain 31337) or Sepolia. For local play, import a
        Hardhat test account into MetaMask first — the steps are in the project README.
      </aside>
    );
  }

  if (chainId !== hardhat.id && chainId !== sepolia.id) {
    return (
      <aside className="mb-10 max-w-xl border border-ember/40 bg-dusk/70 px-5 py-4 text-sm text-paper">
        Switch MetaMask to Localhost 8545 or Sepolia. Other networks are not wired up.
      </aside>
    );
  }

  if (!card || !market) {
    return (
      <aside className="mb-10 max-w-xl border border-ember/40 bg-dusk/70 px-5 py-4 text-sm leading-relaxed text-paper">
        No contracts found for this chain. Keep `npx hardhat node` running, then from the repo root
        run `npm run deploy:local`. That writes addresses into `frontend/lib/deployed.json`.
      </aside>
    );
  }

  return null;
}
