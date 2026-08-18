import type { Metadata } from "next";

import { DesignSystemShowcase } from "@/features/design-system/components/DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System",
  description: "PLAN&WITH 디자인 토큰 및 공통 컴포넌트 가이드",
};

export default function DesignSystemPage() {
  return <DesignSystemShowcase />;
}
