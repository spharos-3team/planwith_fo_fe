import { ChevronDown } from "lucide-react";
import { type ReactElement, type SelectHTMLAttributes, useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  showLabel?: boolean;
}

export function SelectField({
  label,
  error,
  options,
  placeholder,
  showLabel = Boolean(label),
  className = "",
  disabled,
  id: idProp,
  ...props
}: SelectFieldProps): ReactElement {
  const generatedId = useId();
  const selectId = idProp ?? generatedId;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(error);

  const fieldClass = [
    "h-12 w-full appearance-none rounded-sm border bg-surface-default px-4 pr-10 text-body-sm text-text-primary outline-none transition",
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
        <label className="text-label-sm text-text-primary" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          aria-describedby={hasError ? errorId : undefined}
          aria-invalid={hasError}
          className={fieldClass}
          disabled={disabled}
          id={selectId}
          {...props}
        >
          {placeholder ? (
            <option disabled value="">
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled"
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
