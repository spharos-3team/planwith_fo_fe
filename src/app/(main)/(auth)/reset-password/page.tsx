import type { Metadata } from "next";

import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
};

export default function ResetPasswordRoutePage() {
  return <ResetPasswordPage />;
}
