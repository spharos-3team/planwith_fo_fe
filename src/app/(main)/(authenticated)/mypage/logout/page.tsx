import type { Metadata } from "next";

import { LogoutPage } from "@/features/mypage/components/LogoutPage";

export const metadata: Metadata = {
  title: "로그아웃",
};

export default function MyPageLogoutRoute() {
  return <LogoutPage />;
}
