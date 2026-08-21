import type { Metadata } from "next";

import { StatusMessage } from "@/components/common/StatusMessage";

export const metadata: Metadata = {
  title: "아이디 찾기",
};

export default function FindEmailPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-section-y">
      <StatusMessage>
        아이디 찾기 화면은 다음 이슈에서 연결됩니다.
      </StatusMessage>
    </div>
  );
}
