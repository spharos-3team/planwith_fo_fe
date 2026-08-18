import { type LucideIcon } from "lucide-react";
import { type InputHTMLAttributes, type ReactElement, useId } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  showLabel?: boolean;
}

export function InputField({
  label,
  error,
  icon: Icon,
  showLabel = Boolean(label),
  className = "",
  disabled,
  id: idProp,
  ...props
}: InputFieldProps): ReactElement {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const fieldClass = [
    "h-12 w-full rounded-sm border bg-surface-default px-4 text-body-sm text-text-primary outline-none transition placeholder:text-text-disabled",
    Icon ? "pl-11" : "",
    hasError
      ? "border-status-error focus:border-status-error"
      : "border-line-default focus:border-brand-primary",
    disabled
      ? "cursor-not-allowed border-line-light bg-surface-page text-text-disabled"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid w-full gap-1.5">
      {showLabel && label && (
        <label className="text-label-sm text-text-primary" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled"
          />
        )}
        <input
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          className={fieldClass}
          disabled={disabled}
          id={inputId}
          {...props}
        />
      </div>
      {hasError && (
        <p className="text-caption text-status-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
