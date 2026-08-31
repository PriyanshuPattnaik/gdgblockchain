"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { decodeEventLog } from "viem";
import { cardAbi } from "@/lib/abi";
import { generateCardArt, svgFile } from "@/lib/card-art";
import { getAddresses } from "@/lib/contracts";
import { pinToIpfs } from "@/lib/ipfs";
import { wagmiConfig } from "@/lib/wagmi";
import { AFFINITIES, ELEMENTS, RARITIES, type Element, type Rarity } from "@/lib/types";

export function MintForm() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { card } = getAddresses(chainId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<Rarity>("Rare");
  const [element, setElement] = useState<Element>("Aether");
  const [affinity, setAffinity] = useState<(typeof AFFINITIES)[number]>("Constellation");
  const [power, setPower] = useState(42);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isConnected || !address) {
      setError("Connect a wallet first.");
      return;
    }
    if (!card) {
      setError("Contracts are not deployed on this network.");
      return;
    }
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    try {
      setStatus("Pinning image…");
      const art =
        file ??
        svgFile(generateCardArt({ name, rarity, element, power }), name);
      const imageUri = await pinToIpfs({ file: art });

      setStatus("Pinning metadata…");
      const metadata = {
        name: name.trim(),
        description: description.trim(),
        image: imageUri,
        attributes: [
          { trait_type: "Rarity", value: rarity },
          { trait_type: "Element", value: element },
          { trait_type: "Affinity", value: affinity },
          { trait_type: "Power", value: power },
        ],
      };
      const tokenURI = await pinToIpfs({ json: metadata });

      setStatus("Waiting for wallet signature…");
      const hash = await writeContractAsync({
        address: card,
        abi: cardAbi,
        functionName: "mintCard",
        args: [tokenURI],
      });

      setStatus("Minting on-chain…");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      const minted = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({ abi: cardAbi, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        })
        .find((item) => item?.eventName === "CardMinted");
      const tokenId =
        minted && minted.eventName === "CardMinted" ? Number(minted.args.tokenId) : undefined;
      router.push(tokenId ? `/card/${tokenId}` : "/collection");
    } catch (err) {
      setStatus("");
      setError(err instanceof Error ? err.message : "Mint failed");
    }
  }

  const busy = isPending || Boolean(status);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field"
          placeholder="Lyra’s Shard"
          required
        />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="field min-h-28"
          placeholder="A splinter of the constellation that fell in the third dusk."
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rarity">
          <select value={rarity} onChange={(e) => setRarity(e.target.value as Rarity)} className="field">
            {RARITIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Element">
          <select
            value={element}
            onChange={(e) => setElement(e.target.value as Element)}
            className="field"
          >
            {ELEMENTS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Affinity">
          <select value={affinity} onChange={(e) => setAffinity(e.target.value as typeof affinity)} className="field">
            {AFFINITIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label={`Power · ${power}`}>
          <input
            type="range"
            min={1}
            max={99}
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </Field>
      </div>
      <Field label="Art (optional)">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-mist file:mr-3 file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-ink"
        />
        <p className="mt-2 text-xs text-mist">
          Skip this and we generate a unique constellation plate from the card’s traits.
        </p>
      </Field>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      {status ? <p className="text-sm text-gold">{status}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="bg-gold px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {busy ? "Inscribing…" : "Mint card"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.2em] text-gold">{label}</span>
      {children}
    </label>
  );
}
