"use client";

import { NetworkNotice } from "@/components/NetworkNotice";
import { MintForm } from "@/components/MintForm";

export default function MintPage() {
  return (
    <main className="pb-8">
      <NetworkNotice />
      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brass">Create</p>
      <h1 className="mt-1 font-display text-4xl text-cream">Stamp a new relic</h1>
      <p className="mt-3 mb-8 max-w-xl text-sm leading-6 text-mute">
        Name it, set traits, and mint an ERC-721. The picture is stored off-chain. The token ID and ownership live on the chain.
      </p>
      <MintForm />
    </main>
  );
}
