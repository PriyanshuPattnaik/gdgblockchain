import { NextResponse } from "next/server";
import { publicOrigin, saveLocalBlob } from "@/lib/local-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const jsonField = form.get("json");
  const jwt = process.env.PINATA_JWT;
  const origin = publicOrigin(request);

  try {
    if (typeof jsonField === "string") {
      if (!jwt) {
        const hash = await saveLocalBlob(Buffer.from(jsonField, "utf8"), "application/json");
        return NextResponse.json({ uri: `${origin}/api/meta/${hash}`, fallback: true });
      }
      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pinataContent: JSON.parse(jsonField) }),
      });
      const body = (await res.json()) as { IpfsHash?: string; error?: { details?: string } };
      if (!res.ok || !body.IpfsHash) {
        return NextResponse.json(
          { error: body.error?.details ?? "Pinata JSON pin failed" },
          { status: 502 }
        );
      }
      return NextResponse.json({ uri: `ipfs://${body.IpfsHash}` });
    }

    if (file instanceof File) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const mime = file.type || "application/octet-stream";
      if (!jwt) {
        const hash = await saveLocalBlob(bytes, mime);
        return NextResponse.json({ uri: `${origin}/api/meta/${hash}`, fallback: true });
      }
      const pinataForm = new FormData();
      pinataForm.set("file", file);
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: pinataForm,
      });
      const body = (await res.json()) as { IpfsHash?: string; error?: { details?: string } };
      if (!res.ok || !body.IpfsHash) {
        return NextResponse.json(
          { error: body.error?.details ?? "Pinata file pin failed" },
          { status: 502 }
        );
      }
      return NextResponse.json({ uri: `ipfs://${body.IpfsHash}` });
    }

    return NextResponse.json({ error: "Expected file or json field" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
