import Link from "next/link";

export function MyPageSectionHeading({
  title,
  description,
  actionHref,
  actionLabel,
  trailingText,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  trailingText?: string;
}) {
  return (
    <div className="flex w-full items-end justify-between gap-4">
      <div>
        <h2 className="text-heading-lg text-text-primary">{title}</h2>
        {description ? (
          <p className="mt-1 text-caption text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="shrink-0 text-caption text-brand-primary underline-offset-4 hover:underline"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : trailingText ? (
        <span className="shrink-0 text-caption text-text-secondary">
          {trailingText}
        </span>
      ) : null}
    </div>
  );
}
