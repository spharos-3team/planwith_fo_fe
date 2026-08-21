interface AuthCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function AuthCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
}: AuthCheckboxProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-body-sm text-text-tertiary">
      <input
        checked={checked}
        className="size-[18px] rounded-xs border-line-light text-brand-primary accent-brand-primary"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}
