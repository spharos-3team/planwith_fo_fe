import { CircleDollarSign } from "lucide-react";

import { StatusMessage } from "@/components/common/StatusMessage";
import { MyPageCard } from "@/features/mypage/components/MyPageCard";

export function PaymentMethodsPage() {
  return (
    <MyPageCard>
      <div>
        <h1 className="text-[18px] font-bold leading-[22px] text-[#1F1F1F]">
          결제수단
        </h1>
        <p className="mt-1 text-[14px] leading-[18px] text-[#615E5B]">
          등록된 카드와 결제 정보를 관리합니다.
        </p>
      </div>

      <div className="w-full">
        <StatusMessage>
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#F6F8FB] text-[#002BFF]">
            <CircleDollarSign aria-hidden="true" className="size-5" />
          </span>
          등록된 결제수단이 없습니다.
          <span className="mt-2 block text-caption text-text-disabled">
            결제수단 연동은 준비 중입니다.
          </span>
        </StatusMessage>
      </div>
    </MyPageCard>
  );
}
