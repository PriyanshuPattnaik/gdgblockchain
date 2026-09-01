import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[oklch(0.85_0.04_80/0.22)] bg-plank/60 px-6 py-14 text-center">
      <p className="font-display text-3xl text-cream">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-mute">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
