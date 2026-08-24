"use client";

import { CreditCard, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { InputField } from "@/components/common/InputField";
import { StatusMessage } from "@/components/common/StatusMessage";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";
import { MyPageSectionHeading } from "@/features/mypage/components/MyPageSectionHeading";

function EmptyTable({ message }: { message: string }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-blue-ice">
      <div className="grid grid-cols-4 bg-surface-page px-5 py-3 text-caption font-semibold text-text-secondary">
        <span>날짜</span>
        <span>내용</span>
        <span>금액</span>
        <span>상태</span>
      </div>
      <div className="px-5 py-8 text-center text-caption text-text-disabled">
        {message}
      </div>
    </div>
  );
}

export function PaymentMethodsPage() {
  const [cardDialogOpen, setCardDialogOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
      <MyPageCard>
        <h1 className="text-heading-lg text-text-primary">결제수단 관리</h1>
        <div className="flex w-full flex-col justify-between gap-4 rounded-lg bg-blue-ice/60 px-6 py-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-caption text-text-secondary">보유 토큰</p>
            <p className="mt-1 text-[28px] font-bold leading-none text-blue-700">
              — P
            </p>
          </div>
          <p className="text-caption text-text-secondary">
            토큰 정보는 결제 API 연동 후 표시됩니다.
          </p>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="토큰 충전에 사용할 카드를 관리하고 기본 결제수단을 설정할 수 있어요."
          title="등록된 결제 수단"
        />
        <div className="w-full">
          <StatusMessage>
            <CreditCard
              aria-hidden="true"
              className="mx-auto mb-3 size-6 text-brand-primary"
            />
            등록된 결제수단이 없습니다.
          </StatusMessage>
        </div>
        <div className="flex w-full justify-end">
          <Button
            icon="left"
            iconComponent={Plus}
            onClick={() => setCardDialogOpen(true)}
            size="sm"
          >
            카드 등록
          </Button>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="토큰 충전, 멤버십 구독 등 실제 결제가 이루어진 내역이에요."
          title="결제 내역"
        />
        <div className="flex flex-wrap gap-2">
          {["전체", "1개월", "3개월", "6개월"].map((period, index) => (
            <button
              className={`h-8 rounded-md px-4 text-caption font-semibold ${
                index === 0
                  ? "bg-blue-700 text-text-inverse"
                  : "border border-blue-ice text-text-secondary"
              }`}
              key={period}
              type="button"
            >
              {period}
            </button>
          ))}
        </div>
        <EmptyTable message="결제 내역이 없습니다." />
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="카드 결제 또는 등급 리워드로 충전된 토큰 내역이에요."
          title="토큰 충전 내역"
        />
        <EmptyTable message="토큰 충전 내역이 없습니다." />
        <div className="flex w-full justify-end">
          <Button disabled size="sm">
            토큰 충전하기
          </Button>
        </div>
      </MyPageCard>

      <MyPageCard>
        <MyPageSectionHeading
          description="토큰이 어디에 사용되었는지 확인할 수 있어요."
          title="토큰 사용 내역"
        />
        <EmptyTable message="토큰 사용 내역이 없습니다." />
      </MyPageCard>

      <aside className="w-full rounded-lg border border-brand-primary/20 bg-blue-ice/50 px-6 py-5">
        <h2 className="text-heading-md text-blue-700">결제 수단 안내</h2>
        <ul className="mt-3 grid gap-2 text-caption leading-5 text-text-secondary">
          <li>• 카드번호·CVV·유효기간·비밀번호는 서버에 저장하지 않습니다.</li>
          <li>• 결제 정보는 PG사의 billingKey를 통해 안전하게 처리됩니다.</li>
          <li>
            • 카드 등록 및 토큰 충전은 결제 API 연동 후 사용할 수 있습니다.
          </li>
        </ul>
      </aside>

      <Dialog
        description="카드 정보는 PG사 등록 화면을 통해 안전하게 처리됩니다."
        onClose={() => setCardDialogOpen(false)}
        open={cardDialogOpen}
        title="카드 등록"
      >
        <div className="grid gap-4">
          <InputField
            disabled
            label="카드 번호"
            placeholder="PG 연동 후 입력"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField disabled label="유효기간" placeholder="MM / YY" />
            <InputField disabled label="CVC" placeholder="000" />
          </div>
          <InputField disabled label="카드 소유자명" placeholder="예금주명" />
          <div className="mt-2 flex justify-end gap-3">
            <Button
              buttonStyle="secondary"
              onClick={() => setCardDialogOpen(false)}
            >
              취소
            </Button>
            <Button disabled>등록하기</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
