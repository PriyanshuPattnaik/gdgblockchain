import { formatEth } from "@/lib/format";

export function StatStrip({
  minted,
  listed,
  floor,
}: {
  minted: number;
  listed: number;
  floor: bigint | null;
}) {
  const items = [
    { label: "Minted", value: String(minted) },
    { label: "For sale", value: String(listed) },
    { label: "Floor", value: floor === null ? "—" : `${formatEth(floor)} ETH` },
  ];

  return (
    <dl className="mb-8 grid grid-cols-3 overflow-hidden rounded-xl border border-[oklch(0.85_0.04_80/0.14)] bg-plank">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`px-4 py-4 ${index > 0 ? "border-l border-[oklch(0.85_0.04_80/0.12)]" : ""}`}
        >
          <dt className="text-[0.65rem] uppercase tracking-[0.16em] text-mute">{item.label}</dt>
          <dd className="mt-1 font-display text-2xl text-cream">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
