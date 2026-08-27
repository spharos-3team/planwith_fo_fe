"use client";

import { useState } from "react";

import { useProfileImageSrc } from "@/features/mypage/hooks/useProfileImageSrc";
import { nicknameInitial } from "@/features/mypage/lib/profile-image";

export function ProfileAvatar({
  src,
  nickname,
  size,
  memberUuid,
  revision,
  className,
}: {
  src: string | null;
  nickname: string;
  size: number;
  memberUuid?: string | null;
  revision?: number | string;
  className?: string;
}) {
  const fetchedSrc = useProfileImageSrc(memberUuid, src, revision);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = fetchedSrc && fetchedSrc !== failedSrc ? fetchedSrc : null;

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-circle bg-blue-ice text-text-secondary ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: Math.max(14, size / 3) }}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailedSrc(imageSrc)}
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
