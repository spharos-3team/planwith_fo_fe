import { setAccessToken } from "@/lib/auth/access-token";

export { getAccessToken, setAccessToken } from "@/lib/auth/access-token";

export function clearAccessToken(): void {
  setAccessToken(null);
}
