import type { Metadata } from "next";

import { MyPageOverviewPage } from "@/features/mypage/components/MyPageOverviewPage";

export const metadata: Metadata = {
  title: "마이페이지",
};

export default function MyPageIndex() {
  return <MyPageOverviewPage />;
}
