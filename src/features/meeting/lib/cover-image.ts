const MAX_EDGE = 1280;
const TARGET_BYTES = 180 * 1024;
const HARD_MAX_BYTES = 2 * 1024 * 1024;

export async function prepareMeetingCoverFile(file: File): Promise<File> {
  if (file.size === 0) {
    throw new Error("이미지 파일이 필요합니다.");
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) {
    throw new Error("jpg/jpeg/png/webp만 업로드할 수 있습니다.");
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("이미지를 처리할 수 없습니다.");
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.85;
  let blob = await canvasToJpeg(canvas, quality);
  while (blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.1;
    blob = await canvasToJpeg(canvas, quality);
  }
  if (blob.size > HARD_MAX_BYTES) {
    throw new Error("이미지 용량은 2MB 이하여야 합니다.");
  }

  return new File([blob], "cover.jpg", { type: "image/jpeg" });
}

function canvasToJpeg(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("이미지를 처리할 수 없습니다."));
      },
      "image/jpeg",
      quality
    );
  });
}
