import type { Metadata } from "next";
import { Suspense } from "react";

import { StatusMessage } from "@/components/common/StatusMessage";
import { ChatPage } from "@/features/chat/components/ChatPage";

export const metadata: Metadata = {
  title: "채팅",
};

export default function ChatRoute() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <StatusMessage>채팅을 불러오는 중입니다.</StatusMessage>
        </div>
      }
    >
      <ChatPage />
    </Suspense>
  );
}
