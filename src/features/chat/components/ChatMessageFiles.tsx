"use client";

import { FileText } from "lucide-react";

import { useChatFileSrc } from "@/features/chat/hooks/useChatFileSrc";
import type { ChatFileAttachment } from "@/features/chat/types";

export function ChatMessageFiles({
  files,
  mine,
}: {
  files: ChatFileAttachment[];
  mine: boolean;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div
      className={`grid gap-2 ${mine ? "justify-items-end" : "justify-items-start"}`}
    >
      {files.map((file) => (
        <ChatMessageFile key={`${file.url}-${file.name ?? ""}`} file={file} />
      ))}
    </div>
  );
}

function ChatMessageFile({ file }: { file: ChatFileAttachment }) {
  const src = useChatFileSrc(file.url);
  const type = file.fileType.toUpperCase();
  const name = file.name?.trim() || "파일";

  if (type === "IMAGE") {
    if (!src) {
      return <FileFallback name={name} />;
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={name}
        className="max-h-64 max-w-full rounded-lg object-cover"
        src={src}
      />
    );
  }

  if (type === "VIDEO") {
    if (!src) {
      return <FileFallback name={name} />;
    }
    return (
      <video
        className="max-h-64 max-w-full rounded-lg"
        controls
        preload="metadata"
        src={src}
      >
        {name}
      </video>
    );
  }

  if (type === "AUDIO") {
    if (!src) {
      return <FileFallback name={name} />;
    }
    return (
      <audio
        className="w-full max-w-xs"
        controls
        preload="metadata"
        src={src}
      />
    );
  }

  return <FileFallback downloadUrl={src} name={name} />;
}

function FileFallback({
  name,
  downloadUrl,
}: {
  name: string;
  downloadUrl?: string | null;
}) {
  const className =
    "inline-flex max-w-full items-center gap-2 rounded-lg bg-surface-page px-3 py-2 text-caption text-text-primary";

  if (downloadUrl) {
    return (
      <a
        className={className}
        download={name}
        href={downloadUrl}
        rel="noreferrer"
      >
        <FileText aria-hidden="true" className="size-4 shrink-0" />
        <span className="truncate">{name}</span>
      </a>
    );
  }

  return (
    <p className={className}>
      <FileText aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">{name}</span>
    </p>
  );
}
