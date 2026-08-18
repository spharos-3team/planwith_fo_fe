import type { ReactNode } from "react";

interface HeroGroupLayoutProps {
  children: ReactNode;
}

export default function HeroGroupLayout({
  children,
}: Readonly<HeroGroupLayoutProps>) {
  return children;
}
