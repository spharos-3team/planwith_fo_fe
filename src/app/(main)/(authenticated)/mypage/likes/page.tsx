import type { Metadata } from "next";

import { LikesPage } from "@/features/mypage/components/LikesPage";

export const metadata: Metadata = {
  title: "좋아요",
};

export default function MyPageLikesRoute() {
  return <LikesPage />;
}
