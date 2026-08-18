import type { ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";

interface ScheduleLayoutProps {
  children: ReactNode;
  authenticated?: boolean;
  headerVariant?: "solid" | "overlay";
}

export function ScheduleLayout({
  children,
  authenticated = true,
  headerVariant = "solid",
}: ScheduleLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header authenticated={authenticated} variant={headerVariant} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
