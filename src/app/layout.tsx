import "./globals.css";

import type { Metadata } from "next";
import { Gothic_A1 } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "./providers";

const gothicA1 = Gothic_A1({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gothic-a1",
  display: "swap",
});

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
    <html className={gothicA1.variable} lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
