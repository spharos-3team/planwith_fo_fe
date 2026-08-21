"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
    return null;
  }

  return children;
}
