import type { Metadata } from "next";

import { SignupPage } from "@/features/auth/components/SignupPage";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupRoutePage() {
  return <SignupPage />;
}
