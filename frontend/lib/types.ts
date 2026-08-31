export const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Mythic"] as const;
export const ELEMENTS = ["Aether", "Ember", "Tide", "Root", "Void", "Dawn"] as const;
export const AFFINITIES = ["Constellation", "Relic", "Beast", "Vessel", "Oracle"] as const;

export type Rarity = (typeof RARITIES)[number];
export type Element = (typeof ELEMENTS)[number];
export type Affinity = (typeof AFFINITIES)[number];

export type Trait = { trait_type: string; value: string | number };

export type CardMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Trait[];
};

export type OnChainCard = {
  tokenId: number;
  owner: `0x${string}`;
  tokenURI: string;
  seller: `0x${string}`;
  price: bigint;
  listed: boolean;
  metadata?: CardMetadata;
};

export function traitValue(meta: CardMetadata | undefined, trait: string): string {
  const hit = meta?.attributes.find((a) => a.trait_type === trait);
  return hit ? String(hit.value) : "";
}

export function parseMetadataJson(raw: string): CardMetadata {
  const parsed = JSON.parse(raw) as CardMetadata;
  if (!parsed?.name || !parsed?.image) {
    throw new Error("Invalid card metadata");
  }
  return {
    name: parsed.name,
    description: parsed.description ?? "",
    image: parsed.image,
    attributes: Array.isArray(parsed.attributes) ? parsed.attributes : [],
  };
}
