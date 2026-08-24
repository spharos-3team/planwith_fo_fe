import type { Metadata } from "next";

import { MembershipPage } from "@/features/mypage/components/MembershipPage";

export const metadata: Metadata = {
  title: "멤버십 관리",
};

export default function MyPageMembershipRoute() {
  return <MembershipPage />;
}
