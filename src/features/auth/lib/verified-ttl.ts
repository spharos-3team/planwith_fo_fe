export const DEFAULT_VERIFIED_TTL_SECONDS = 7200;

export function verifiedUntilFromExpiresIn(
  expiresInSeconds?: number | null
): number {
  const seconds =
    expiresInSeconds && expiresInSeconds > 0
      ? expiresInSeconds
      : DEFAULT_VERIFIED_TTL_SECONDS;
  return Date.now() + seconds * 1000;
}

export function remainingVerifiedSeconds(
  until: number | null | undefined,
  now = Date.now()
): number {
  if (!until) {
    return 0;
  }
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export function isVerifiedStillValid(
  verified: boolean,
  until: number | null | undefined,
  now = Date.now()
): boolean {
  if (!verified) {
    return false;
  }
  if (!until) {
    return true;
  }
  return remainingVerifiedSeconds(until, now) > 0;
}

export function formatVerifiedRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
