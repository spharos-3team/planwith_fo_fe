import type { ReactNode } from "react";

import { Footer } from "./Footer";
import { Header } from "./Header";

export interface SiteLayoutProps {
  children: ReactNode;
  authenticated?: boolean;
  headerVariant?: "solid" | "overlay";
  footerVariant?: "overlay" | "solid";
  activeHref?: string;
  showFooter?: boolean;
}

export function SiteLayout({
  children,
  authenticated,
  headerVariant = "solid",
  footerVariant,
  activeHref,
  showFooter = true,
}: SiteLayoutProps) {
  const resolvedFooterVariant = footerVariant ?? headerVariant;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        activeHref={activeHref}
        authenticated={authenticated}
        variant={headerVariant}
      />
      <main className="flex-1">{children}</main>
      {showFooter ? <Footer variant={resolvedFooterVariant} /> : null}
    </div>
  );
}
