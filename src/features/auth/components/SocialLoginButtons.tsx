"use client";

import type { SocialProvider } from "@/types/api";

interface SocialLoginButtonsProps {
  onSelect: (provider: SocialProvider) => void;
  disabled?: boolean;
}

const providers: {
  id: SocialProvider;
  label: string;
  className: string;
  mark: string;
}[] = [
  {
    id: "naver",
    label: "네이버로 로그인",
    className: "bg-[#03C75A] text-white",
    mark: "N",
  },
  {
    id: "kakao",
    label: "카카오로 로그인",
    className: "bg-[#FEE500] text-[#191919]",
    mark: "K",
  },
  {
    id: "google",
    label: "Google로 로그인",
    className: "border border-line-light bg-surface-default text-text-primary",
    mark: "G",
  },
];

export function SocialLoginButtons({
  onSelect,
  disabled = false,
}: SocialLoginButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-10">
      {providers.map((provider) => (
        <button
          aria-label={provider.label}
          className={`grid size-[55px] place-items-center rounded-circle text-heading-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${provider.className}`}
          disabled={disabled}
          key={provider.id}
          onClick={() => onSelect(provider.id)}
          type="button"
        >
          {provider.mark}
        </button>
      ))}
    </div>
  );
}
