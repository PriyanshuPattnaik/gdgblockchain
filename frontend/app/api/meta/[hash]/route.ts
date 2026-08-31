import { NextResponse } from "next/server";
import { readLocalBlob } from "@/lib/local-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ hash: string }> | { hash: string } }
) {
  const { hash } = await Promise.resolve(context.params);
  const blob = await readLocalBlob(hash);
  if (!blob) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(blob.bytes), {
    headers: {
      "Content-Type": blob.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
