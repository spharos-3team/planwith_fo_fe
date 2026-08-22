import type { Metadata } from "next";

import { FindEmailPage } from "@/features/auth/components/FindEmailPage";

export const metadata: Metadata = {
  title: "아이디 찾기",
};

export default function FindEmailRoutePage() {
  return <FindEmailPage />;
}
