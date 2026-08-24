import type { Metadata } from "next";

import { MyStoriesPage } from "@/features/mypage/components/MyStoriesPage";

export const metadata: Metadata = {
  title: "내 여행 스토리",
};

export default function MyStoriesRoute() {
  return <MyStoriesPage />;
}
