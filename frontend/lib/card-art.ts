import type { Element, Rarity } from "./types";

const ELEMENT_HUES: Record<Element, [number, number, number]> = {
  Aether: [262, 78, 210],
  Ember: [18, 82, 48],
  Tide: [188, 72, 168],
  Root: [132, 58, 92],
  Void: [286, 22, 48],
  Dawn: [32, 86, 196],
};

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateCardArt(params: {
  name: string;
  rarity: Rarity;
  element: Element;
  power: number;
}): string {
  const seed = hash(`${params.name}|${params.element}|${params.rarity}|${params.power}`);
  const rand = rng(seed);
  const [h, s, l] = ELEMENT_HUES[params.element];
  const stars = 14 + Math.floor(rand() * 12);
  const starEls: string[] = [];
  for (let i = 0; i < stars; i += 1) {
    const x = 18 + rand() * 264;
    const y = 24 + rand() * 220;
    const r = 0.6 + rand() * 2.4;
    const o = 0.35 + rand() * 0.65;
    starEls.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f4ead2" opacity="${o.toFixed(2)}"/>`);
  }

  const arcs = 3 + Math.floor(rand() * 3);
  const pathEls: string[] = [];
  for (let i = 0; i < arcs; i += 1) {
    const x1 = 40 + rand() * 220;
    const y1 = 40 + rand() * 180;
    const x2 = 40 + rand() * 220;
    const y2 = 40 + rand() * 180;
    pathEls.push(
      `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} Q 150 ${80 + rand() * 120} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="rgba(244,234,210,0.28)" stroke-width="0.8"/>`
    );
  }

  const foil =
    params.rarity === "Mythic"
      ? "url(#mythic)"
      : params.rarity === "Legendary"
        ? "url(#legend)"
        : `hsl(${h} ${s}% ${Math.max(8, l / 8)}%)`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="300" height="360">
  <defs>
    <radialGradient id="nebula" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="hsl(${h} ${s}% ${l}%)" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="hsl(${(h + 28) % 360} ${Math.max(20, s - 20)}% ${Math.max(10, l - 28)}%)"/>
      <stop offset="100%" stop-color="#140f18"/>
    </radialGradient>
    <linearGradient id="legend" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8a5a18"/>
      <stop offset="50%" stop-color="#e4c27a"/>
      <stop offset="100%" stop-color="#5c3a12"/>
    </linearGradient>
    <linearGradient id="mythic" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#6b1d2a"/>
      <stop offset="50%" stop-color="#d4784a"/>
      <stop offset="100%" stop-color="#2a1030"/>
    </linearGradient>
  </defs>
  <rect width="300" height="360" rx="18" fill="${foil}"/>
  <rect x="10" y="10" width="280" height="340" rx="12" fill="url(#nebula)"/>
  ${pathEls.join("")}
  ${starEls.join("")}
  <text x="24" y="328" fill="#f4ead2" font-family="Georgia, serif" font-size="13" letter-spacing="2">${params.element.toUpperCase()}</text>
  <text x="276" y="328" text-anchor="end" fill="#e4c27a" font-family="Georgia, serif" font-size="18">${params.power}</text>
</svg>`;
}

export function svgFile(svg: string, name: string): File {
  return new File([svg], `${name.replace(/\s+/g, "-").toLowerCase()}.svg`, {
    type: "image/svg+xml",
  });
}
