import { type LucideIcon, Sparkles } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type ReactElement,
  type ReactNode,
} from "react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonStyle = "primary" | "secondary" | "ghost" | "danger" | "inverse";
type ButtonIcon = "none" | "left";

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-5 text-body-md",
  md: "h-[46px] px-6 text-body-md",
  lg: "h-[68px] px-8 text-body-md",
};

const styleClasses: Record<ButtonStyle, string> = {
  primary:
    "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover disabled:bg-brand-primary/40",
  secondary:
    "border border-line-default bg-surface-default text-text-primary hover:bg-surface-page disabled:border-line-light disabled:text-text-disabled",
  ghost:
    "bg-transparent text-text-primary hover:bg-surface-page disabled:text-text-disabled",
  danger:
    "bg-status-error text-text-inverse hover:bg-status-error/90 disabled:bg-status-error/40",
  inverse:
    "bg-surface-default text-text-primary hover:bg-surface-page disabled:bg-surface-default/60 disabled:text-text-disabled",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  buttonStyle?: ButtonStyle;
  icon?: ButtonIcon;
  iconComponent?: LucideIcon;
  pill?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      size = "md",
      buttonStyle = "primary",
      icon = "none",
      iconComponent: IconComponent = Sparkles,
      pill = false,
      className = "",
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ): ReactElement {
    const radiusClass = pill ? "rounded-full" : "rounded-md";
    const iconGap = icon === "left" ? "gap-2" : "";

    return (
      <button
        className={`inline-flex items-center justify-center font-bold transition disabled:cursor-not-allowed ${sizeClasses[size]} ${styleClasses[buttonStyle]} ${radiusClass} ${iconGap} ${className}`}
        disabled={disabled}
        ref={ref}
        type={type}
        {...props}
      >
        {icon === "left" && (
          <IconComponent aria-hidden="true" className="h-4 w-4 shrink-0" />
        )}
        {children}
      </button>
    );
  }
);
