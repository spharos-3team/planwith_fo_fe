"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { MemberProfile } from "@/features/auth/types";
import { setAccessToken } from "@/lib/auth/access-token";
import { getMyProfile } from "@/services/auth/member";
import {
  login as loginRequest,
  logout as logoutRequest,
} from "@/services/auth/session";
import type { TokenResponse } from "@/types/api";
import { refreshAccessToken } from "@/utils/apiClient";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  profile: MemberProfile | null;
  profileRevision: number;
  login: (email: string, password: string) => Promise<void>;
  applySession: (tokens: TokenResponse) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(): Promise<MemberProfile | null> {
  try {
    return await getMyProfile();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [profileRevision, setProfileRevision] = useState(0);
  const statusRef = useRef<AuthStatus>("initializing");

  const commitProfile = useCallback((nextProfile: MemberProfile | null) => {
    setProfile(nextProfile);
    setProfileRevision((current) => current + 1);
  }, []);

  const applySession = useCallback(
    async (tokens: TokenResponse) => {
      statusRef.current = "authenticated";
      setAccessToken(tokens.accessToken);
      const nextProfile = await loadProfile();
      commitProfile(nextProfile);
      setStatus("authenticated");
    },
    [commitProfile]
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setProfile(null);
    setProfileRevision(0);
    statusRef.current = "unauthenticated";
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then(async (token) => {
        const alreadyAuthenticated = () =>
          statusRef.current === "authenticated";

        if (cancelled || alreadyAuthenticated()) {
          return;
        }

        if (!token) {
          clearSession();
          return;
        }

        const nextProfile = await loadProfile();
        if (cancelled || alreadyAuthenticated()) {
          return;
        }

        commitProfile(nextProfile);
        statusRef.current = "authenticated";
        setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled && statusRef.current !== "authenticated") {
          clearSession();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, commitProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginRequest(email, password);
      await applySession(tokens);
    },
    [applySession]
  );

  const refreshProfile = useCallback(async () => {
    const nextProfile = await loadProfile();
    commitProfile(nextProfile);
  }, [commitProfile]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated: status === "authenticated",
      profile,
      profileRevision,
      login,
      applySession,
      refreshProfile,
      logout,
    }),
    [
      applySession,
      login,
      logout,
      profile,
      profileRevision,
      refreshProfile,
      status,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

export function useAuth(): AuthContextValue {
  const context = useOptionalAuth();

  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }

  return context;
}
