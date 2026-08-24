import type { Metadata } from "next";

import { LogoutCompletedPage } from "@/features/mypage/components/LogoutCompletedPage";

export const metadata: Metadata = {
  title: "로그아웃 완료",
};

export default function LogoutCompletedRoute() {
  return <LogoutCompletedPage />;
}
