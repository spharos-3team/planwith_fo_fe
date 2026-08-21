import type { Metadata } from "next";

import { LoginPage } from "@/features/auth/components/LoginPage";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginRoutePage() {
  return <LoginPage />;
}
