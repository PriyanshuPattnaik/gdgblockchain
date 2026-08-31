"use client";

import { NetworkNotice } from "@/components/NetworkNotice";
import { MintForm } from "@/components/MintForm";

export default function MintPage() {
  return (
    <main className="max-w-xl">
      <NetworkNotice />
      <p className="text-[0.7rem] uppercase tracking-[0.32em] text-gold">Inscribe</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-light">
        Bind a new relic
      </h2>
      <p className="mt-4 mb-8 text-mist leading-7">
        Name it, give it traits, and optionally upload art. We pin image + metadata to IPFS (or a
        local data URI if Pinata is not configured), then mint an ERC-721 with a unique token ID.
      </p>
      <MintForm />
    </main>
  );
}
