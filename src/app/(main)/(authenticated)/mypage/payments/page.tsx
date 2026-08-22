import type { Metadata } from "next";

import { PaymentMethodsPage } from "@/features/mypage/components/PaymentMethodsPage";

export const metadata: Metadata = {
  title: "결제수단",
};

export default function MyPagePaymentsRoute() {
  return <PaymentMethodsPage />;
}
