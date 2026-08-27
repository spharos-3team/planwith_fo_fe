"use client";

import Link from "next/link";

import { useOptionalAuth } from "@/features/auth/context/AuthProvider";

export function StoryCreateAction() {
  const auth = useOptionalAuth();

  if (!auth?.isAuthenticated) {
    return null;
  }

  return (
    <Link
      className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-header-nav-active px-5 text-label-sm text-text-inverse transition hover:bg-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2"
      href="/community/stories/new"
    >
      스토리 생성
    </Link>
  );
}
