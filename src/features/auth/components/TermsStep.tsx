"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { AuthCheckbox } from "@/features/auth/components/AuthCheckbox";
import { AuthLoginLink } from "@/features/auth/components/AuthHero";
import { SignupStepper } from "@/features/auth/components/SignupStepper";
import type { TermItem } from "@/features/auth/types";
import { getTermDetail, listTerms } from "@/services/auth/member";

interface TermsStepProps {
  over14: boolean;
  agreements: Record<string, boolean>;
  marketingEmail: boolean;
  marketingSms: boolean;
  onOver14Change: (value: boolean) => void;
  onAgreementChange: (termUuid: string, agreed: boolean) => void;
  onMarketingChange: (channel: "email" | "sms", value: boolean) => void;
  onNext: () => void;
}

export function TermsStep({
  over14,
  agreements,
  marketingEmail,
  marketingSms,
  onOver14Change,
  onAgreementChange,
  onMarketingChange,
  onNext,
}: TermsStepProps) {
  const [viewingTerm, setViewingTerm] = useState<TermItem | null>(null);
  const termsQuery = useQuery({
    queryKey: ["terms"],
    queryFn: listTerms,
  });
  const detailQuery = useQuery({
    queryKey: ["term-detail", viewingTerm?.termUuid],
    queryFn: () => getTermDetail(viewingTerm?.termUuid ?? ""),
    enabled: Boolean(viewingTerm),
  });

  const terms = termsQuery.data ?? [];
  const requiredAgreed = terms
    .filter((term) => term.isRequired)
    .every((term) => agreements[term.termUuid]);
  const allSelected =
    over14 &&
    terms.every((term) => agreements[term.termUuid]) &&
    marketingEmail &&
    marketingSms;

  const toggleAll = (checked: boolean) => {
    onOver14Change(checked);
    terms.forEach((term) => onAgreementChange(term.termUuid, checked));
    onMarketingChange("email", checked);
    onMarketingChange("sms", checked);
  };

  return (
    <div className="flex w-full max-w-[724px] flex-col items-center">
      <SignupStepper currentStep={1} />
      <h1 className="mt-8 text-[29px] font-extrabold text-text-primary">
        약관 동의
      </h1>
      <p className="mt-2 text-body-sm text-text-tertiary">
        서비스 이용을 위해 아래 약관에 동의해주세요
      </p>

      <div className="mt-16 w-full">
        <div className="flex h-11 items-center">
          <AuthCheckbox
            checked={allSelected}
            label="전체선택"
            onChange={toggleAll}
          />
        </div>

        <div className="mx-auto mt-1 grid w-full max-w-[684px]">
          <div className="flex h-10 items-center justify-between gap-2">
            <AuthCheckbox
              checked={over14}
              label="[필수] 만 14세 이상입니다"
              onChange={onOver14Change}
            />
          </div>

          {termsQuery.isError ? (
            <p className="py-4 text-caption text-status-error" role="alert">
              약관 목록을 불러오지 못했습니다.
            </p>
          ) : null}

          {terms.map((term) => (
            <div
              className="flex h-10 items-center justify-between gap-3"
              key={term.termUuid}
            >
              <AuthCheckbox
                checked={Boolean(agreements[term.termUuid])}
                label={`${term.isRequired ? "[필수]" : "[선택]"} ${term.title}`}
                onChange={(checked) =>
                  onAgreementChange(term.termUuid, checked)
                }
              />
              <button
                className="shrink-0 text-label-md underline"
                onClick={() => setViewingTerm(term)}
                type="button"
              >
                보기
              </button>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 w-full max-w-[684px] rounded-lg border-[1.5px] border-line-light px-6 py-4">
          <p className="text-body-sm font-semibold text-text-tertiary">
            광고성 정보 수신 동의 (선택)
          </p>
          <div className="mt-5 flex gap-8">
            <AuthCheckbox
              checked={marketingEmail}
              label="E-mail"
              onChange={(checked) => onMarketingChange("email", checked)}
            />
            <AuthCheckbox
              checked={marketingSms}
              label="SMS"
              onChange={(checked) => onMarketingChange("sms", checked)}
            />
          </div>
        </div>
      </div>

      <Button
        className="mt-12 w-[200px] tracking-[1.5px]"
        disabled={!over14 || !requiredAgreed}
        onClick={onNext}
      >
        다음
      </Button>
      <div className="mt-4">
        <AuthLoginLink />
      </div>

      <Dialog
        onClose={() => setViewingTerm(null)}
        open={Boolean(viewingTerm)}
        title={viewingTerm?.title ?? "약관"}
      >
        <div className="max-h-80 overflow-auto whitespace-pre-wrap text-body-sm text-text-secondary">
          {detailQuery.data?.content ?? "약관 내용을 불러오는 중입니다."}
        </div>
      </Dialog>
    </div>
  );
}
