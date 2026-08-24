import type { Metadata } from "next";

import { LikesPage } from "@/features/mypage/components/LikesPage";

export const metadata: Metadata = {
  title: "좋아요한 스토리",
};

export default function LikedStoriesRoute() {
  return <LikesPage expanded />;
}
