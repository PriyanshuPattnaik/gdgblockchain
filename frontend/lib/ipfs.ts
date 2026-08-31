import { parseMetadataJson, type CardMetadata } from "./types";

const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
];

export function toHttpUri(uri: string, gatewayIndex = 0): string {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `${GATEWAYS[gatewayIndex % GATEWAYS.length]}${uri.slice(7)}`;
  }
  return uri;
}

export async function fetchMetadata(uri: string): Promise<CardMetadata> {
  if (uri.startsWith("data:application/json")) {
    const payload = decodeDataUri(uri);
    return parseMetadataJson(payload);
  }

  let lastError: unknown;
  for (let i = 0; i < GATEWAYS.length; i += 1) {
    try {
      const res = await fetch(toHttpUri(uri, i));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseMetadataJson(await res.text());
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Failed to load metadata");
}

function decodeDataUri(uri: string): string {
  const comma = uri.indexOf(",");
  const header = uri.slice(0, comma);
  const data = uri.slice(comma + 1);
  if (header.includes(";base64")) {
    if (typeof atob === "function") return atob(data);
    return Buffer.from(data, "base64").toString("utf8");
  }
  return decodeURIComponent(data);
}

export async function pinToIpfs(input: { file?: File; json?: unknown }): Promise<string> {
  const form = new FormData();
  if (input.file) form.set("file", input.file);
  if (input.json !== undefined) form.set("json", JSON.stringify(input.json));

  const res = await fetch("/api/ipfs", { method: "POST", body: form });
  const body = (await res.json()) as { uri?: string; error?: string };
  if (!res.ok || !body.uri) {
    throw new Error(body.error ?? "IPFS upload failed");
  }
  return body.uri;
}
