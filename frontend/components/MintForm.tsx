"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
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
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const generated = useMemo(
    () => generateCardArt({ name: name || "Untitled relic", rarity, element, power }),
    [name, rarity, element, power]
  );

  const artSrc =
    previewUrl || `data:image/svg+xml;utf8,${encodeURIComponent(generated)}`;

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
      setStatus("Saving art");
      const art = file ?? svgFile(generated, name);
      const imageUri = await pinToIpfs({ file: art });

      setStatus("Saving metadata");
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

      setStatus("Confirm in wallet");
      const hash = await writeContractAsync({
        address: card,
        abi: cardAbi,
        functionName: "mintCard",
        args: [tokenURI],
      });

      setStatus("Minting on-chain");
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
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
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
        <Field label="Lore">
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
            <select
              value={affinity}
              onChange={(e) => setAffinity(e.target.value as typeof affinity)}
              className="field"
            >
              {AFFINITIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label={`Power ${power}`}>
            <input
              type="range"
              min={1}
              max={99}
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="mt-3 w-full accent-brass"
            />
          </Field>
        </div>
        <Field label="Custom art (optional)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              setPreviewUrl(next ? URL.createObjectURL(next) : "");
            }}
            className="text-sm text-mute file:mr-3 file:rounded-md file:border-0 file:bg-brass file:px-3 file:py-1.5 file:text-void"
          />
          <p className="mt-2 text-xs text-mute">
            Skip this and we stamp a unique constellation plate from the traits. Art is stored off-chain; only a short link is minted.
          </p>
        </Field>
        {error ? <p className="text-sm text-alert">{error}</p> : null}
        {status ? <p className="text-sm text-brass">{status}</p> : null}
        <button type="submit" disabled={busy} className="btn">
          {busy ? status || "Working" : "Mint card"}
        </button>
      </form>

      <aside className="lg:sticky lg:top-24">
        <p className="mb-3 text-[0.65rem] uppercase tracking-[0.16em] text-mute">Live proof</p>
        <div className="foil-legendary overflow-hidden rounded-xl bg-plank">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={artSrc} alt="Card preview" className="aspect-[5/7] w-full object-cover" />
          <div className="px-3 py-3">
            <p className="font-display text-xl">{name || "Untitled relic"}</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-mute">
              {rarity} · {element} · {power}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.16em] text-mute">{label}</span>
      {children}
    </label>
  );
}
