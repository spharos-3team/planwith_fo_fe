"use client";

import { useState } from "react";

import {
  isDisplayableImageUrl,
  nicknameInitial,
} from "@/features/mypage/lib/profile-image";

export function ProfileAvatar({
  src,
  nickname,
  size,
}: {
  src: string | null;
  nickname: string;
  size: number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = isDisplayableImageUrl(src) && src !== failedSrc ? src : null;

  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-circle bg-blue-ice text-text-secondary"
      style={{ width: size, height: size, fontSize: Math.max(14, size / 3) }}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
          src={imageSrc}
        />
      ) : (
        <span className="font-bold leading-none">
          {nicknameInitial(nickname)}
        </span>
      )}
    </div>
  );
}
