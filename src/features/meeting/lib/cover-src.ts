import { authenticatedFetch } from "@/utils/apiClient";

const STORAGE_PREFIX = "planwith.meeting-cover.";

export function isDirectCoverUrl(value: string | null | undefined): boolean {
  return Boolean(value && /^(https?:|blob:|data:)/i.test(value));
}

export function meetingCoverStorageKey(meetingUuid: string): string {
  return `${STORAGE_PREFIX}${meetingUuid}`;
}

export async function rememberMeetingCover(
  meetingUuid: string,
  file: Blob
): Promise<void> {
  const dataUrl = await blobToDataUrl(file);
  try {
    sessionStorage.setItem(meetingCoverStorageKey(meetingUuid), dataUrl);
  } catch {
    // Ignore quota / private mode.
  }
}

export function rememberedMeetingCover(meetingUuid: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(meetingCoverStorageKey(meetingUuid));
  } catch {
    return null;
  }
}

export function meetingCoverRequestPath(
  meetingUuid: string,
  coverImage: string | null | undefined
): string | null {
  if (!coverImage || isDirectCoverUrl(coverImage)) {
    return null;
  }

  return `/meetings/${meetingUuid}/cover-image`;
}

export async function fetchMeetingCoverObjectUrl(
  meetingUuid: string
): Promise<string | null> {
  const response = await authenticatedFetch(
    `/meetings/${meetingUuid}/cover-image`
  );
  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  if (blob.size === 0) {
    return null;
  }

  const type = (
    blob.type ||
    response.headers.get("content-type") ||
    ""
  ).toLowerCase();
  if (
    type.includes("json") ||
    type.includes("html") ||
    type.includes("text/")
  ) {
    return null;
  }

  return URL.createObjectURL(blob);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
