import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const dir = path.join(process.cwd(), ".local-ipfs");

export async function saveLocalBlob(bytes: Buffer, mime: string): Promise<string> {
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 24);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, hash), bytes);
  await writeFile(path.join(dir, `${hash}.type`), mime, "utf8");
  return hash;
}

export async function readLocalBlob(hash: string): Promise<{ bytes: Buffer; mime: string } | null> {
  if (!/^[a-f0-9]{24}$/.test(hash)) return null;
  try {
    const bytes = await readFile(path.join(dir, hash));
    const mime = (await readFile(path.join(dir, `${hash}.type`), "utf8")).trim();
    return { bytes, mime: mime || "application/octet-stream" };
  } catch {
    return null;
  }
}

export function publicOrigin(request: Request): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
