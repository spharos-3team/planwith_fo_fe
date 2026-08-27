import { authenticatedFetch } from "@/utils/apiClient";

export const PROFILE_IMAGE_MIN_PX = 512;
export const PROFILE_IMAGE_MAX_PX = 1024;
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
export const PROFILE_IMAGE_HINT =
  "JPG, JPEG, PNG, WebP · 최대 5MB · 권장 512×512px";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function isDisplayableImageUrl(
  url: string | null | undefined
): url is string {
  return Boolean(url && /^(blob:|data:)/i.test(url));
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
  memberUuid: string,
  revision?: number | string
): Promise<string | null> {
  const query =
    revision === undefined || revision === ""
      ? ""
      : `?t=${encodeURIComponent(String(revision))}`;
  const response = await authenticatedFetch(
    `/members/${memberUuid}/profile-image${query}`,
    { cache: "no-store" }
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

  const contentType = resolveImageType(file);
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const sourceSize = Math.min(image.width, image.height);
    if (sourceSize <= 0) {
      throw new Error("실제 이미지 파일이 아닙니다.");
    }

    const storedSize = Math.min(
      PROFILE_IMAGE_MAX_PX,
      Math.max(PROFILE_IMAGE_MIN_PX, sourceSize)
    );
    const canvas = document.createElement("canvas");
    canvas.width = storedSize;
    canvas.height = storedSize;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("프로필 이미지를 처리할 수 없습니다.");
    }

    const cropX = (image.width - sourceSize) / 2;
    const cropY = (image.height - sourceSize) / 2;
    context.drawImage(
      image,
      cropX,
      cropY,
      sourceSize,
      sourceSize,
      0,
      0,
      storedSize,
      storedSize
    );

    const blob = await canvasToBlob(canvas, contentType);
    const extension = extensionOf(blob.type);

    return new File([blob], `profile.${extension}`, { type: blob.type });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function resolveImageType(file: File): string {
  const type = (file.type || "").toLowerCase();
  if (ALLOWED_TYPES.has(type)) {
    return type === "image/jpg" ? "image/jpeg" : type;
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (name.endsWith(".png")) {
    return "image/png";
  }
  if (name.endsWith(".webp")) {
    return "image/webp";
  }

  throw new Error("JPG, JPEG, PNG, WebP만 업로드할 수 있습니다.");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("실제 이미지 파일이 아닙니다."));
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
