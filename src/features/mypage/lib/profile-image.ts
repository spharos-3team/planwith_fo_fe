import { authenticatedFetch } from "@/utils/apiClient";

const PROFILE_IMAGE_SIZE = 400;
const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function isDisplayableImageUrl(
  url: string | null | undefined
): url is string {
  return Boolean(url && /^(https?:|blob:|data:)/i.test(url));
}

export function profileImageRequestPath(
  memberUuid: string | null | undefined,
  src: string | null | undefined
): string | null {
  if (isDisplayableImageUrl(src)) {
    return null;
  }

  const pathSrc = typeof src === "string" ? src : "";
  const fromUrl = pathSrc.match(/\/members\/([^/?]+)\/profile-image(?:\?|$)/);
  if (fromUrl) {
    return `/members/${fromUrl[1]}/profile-image`;
  }
  if (memberUuid) {
    return `/members/${memberUuid}/profile-image`;
  }
  return null;
}

export async function fetchProfileImageObjectUrl(
  memberUuid: string
): Promise<string | null> {
  const response = await authenticatedFetch(
    `/members/${memberUuid}/profile-image`
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

export function nicknameInitial(nickname: string): string {
  const trimmed = nickname.trim();
  return trimmed ? [...trimmed][0] : "?";
}

export async function toProfileImageFile(file: File): Promise<File> {
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    throw new Error("이미지 용량은 5MB 이하여야 합니다.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = PROFILE_IMAGE_SIZE;
    canvas.height = PROFILE_IMAGE_SIZE;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("프로필 이미지를 처리할 수 없습니다.");
    }

    const scale = Math.max(
      PROFILE_IMAGE_SIZE / image.width,
      PROFILE_IMAGE_SIZE / image.height
    );
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    context.drawImage(
      image,
      (PROFILE_IMAGE_SIZE - drawWidth) / 2,
      (PROFILE_IMAGE_SIZE - drawHeight) / 2,
      drawWidth,
      drawHeight
    );

    const blob = await canvasToBlob(canvas, file.type);
    const extension = extensionOf(blob.type);

    return new File([blob], `profile.${extension}`, { type: blob.type });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("프로필 이미지를 읽을 수 없습니다."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, sourceType: string) {
  const type = ["image/jpeg", "image/png", "image/webp"].includes(sourceType)
    ? sourceType
    : "image/jpeg";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("프로필 이미지를 변환하지 못했습니다."));
        return;
      }

      resolve(blob);
    }, type);
  });
}

function extensionOf(type: string): string {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}
