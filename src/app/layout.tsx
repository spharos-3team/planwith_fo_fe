import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "PLAN&WITH",
    template: "%s | PLAN&WITH",
  },
  description: "PLAN&WITH 프론트엔드 서비스",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
