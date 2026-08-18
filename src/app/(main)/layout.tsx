import type { ReactNode } from "react";

interface MainGroupLayoutProps {
  children: ReactNode;
}

export default function MainGroupLayout({
  children,
}: Readonly<MainGroupLayoutProps>) {
  return children;
}
