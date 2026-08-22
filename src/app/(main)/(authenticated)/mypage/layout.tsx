import type { ReactNode } from "react";

import { MyPageShell } from "@/features/mypage/components/MyPageShell";

export default function MyPageLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <MyPageShell>{children}</MyPageShell>;
}
