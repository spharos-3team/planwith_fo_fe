import type { Metadata } from "next";

import { ProfileEditPage } from "@/features/mypage/components/ProfileEditPage";

export const metadata: Metadata = {
  title: "개인정보 수정",
};

export default function MyPageProfileRoute() {
  return <ProfileEditPage />;
}
