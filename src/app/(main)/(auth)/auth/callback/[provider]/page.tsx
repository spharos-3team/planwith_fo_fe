import { Suspense } from "react";

import { StatusMessage } from "@/components/common/StatusMessage";
import { SocialCallbackPage } from "@/features/auth/components/SocialCallbackPage";

interface SocialCallbackRouteProps {
  params: Promise<{ provider: string }>;
}

export default async function SocialCallbackRoute({
  params,
}: SocialCallbackRouteProps) {
  const { provider } = await params;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-6 py-section-y">
          <StatusMessage>소셜 로그인 처리 중입니다.</StatusMessage>
        </div>
      }
    >
      <SocialCallbackPage provider={provider} />
    </Suspense>
  );
}
