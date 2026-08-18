import { type HTMLAttributes, type ReactElement, type ReactNode } from "react";

export type BadgeVariant = "subtle" | "solid" | "dot";
export type BadgeTone = "blue" | "green" | "purple" | "orange" | "gray";
export type BadgeSize = "sm" | "md";

const subtleToneClasses: Record<BadgeTone, string> = {
  blue: "bg-badge-blue-bg text-badge-blue-fg",
  green: "bg-badge-green-bg text-badge-green-fg",
  purple: "bg-badge-purple-bg text-badge-purple-fg",
  orange: "bg-badge-orange-bg text-badge-orange-fg",
  gray: "bg-badge-gray-bg text-badge-gray-fg",
};

const solidToneClasses: Record<BadgeTone, string> = {
  blue: "bg-brand-primary text-text-inverse",
  green: "bg-status-success text-text-inverse",
  purple: "bg-accent-ai text-text-inverse",
  orange: "bg-accent-gold text-text-inverse",
  gray: "bg-gray-500 text-text-inverse",
};

const dotToneClasses: Record<BadgeTone, string> = {
  blue: "bg-brand-primary",
  green: "bg-status-success",
  purple: "bg-accent-ai",
  orange: "bg-accent-gold",
  gray: "bg-gray-500",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-caption-sm",
  md: "px-4 py-1.5 text-caption-sm",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
}

export function Badge({
  children,
  variant = "subtle",
  tone = "gray",
  size = "sm",
  className = "",
  ...props
}: BadgeProps): ReactElement {
  if (variant === "dot") {
    return (
      <span
        aria-hidden="true"
        className={`inline-block size-2 shrink-0 rounded-circle ${dotToneClasses[tone]} ${className}`}
        {...props}
      />
    );
  }

  const radiusClass =
    variant === "solid"
      ? size === "md"
        ? "rounded-md"
        : "rounded-full"
      : "rounded-xs";

  const toneClass =
    variant === "solid" ? solidToneClasses[tone] : subtleToneClasses[tone];

  return (
    <span
      className={`inline-flex items-center justify-center font-bold ${radiusClass} ${sizeClasses[size]} ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
