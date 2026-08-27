"use client";

import { Paperclip, Send, X } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";

import {
  CHAT_FILE_MAX_BYTES,
  CHAT_FILE_MAX_COUNT,
} from "@/features/chat/lib/file-src";
import type { ChatSendPayload } from "@/features/chat/types";

interface ChatComposerProps {
  disabled: boolean;
  sending: boolean;
  placeholder: string;
  onSend: (payload: ChatSendPayload) => boolean | Promise<boolean>;
}

export function ChatComposer({
  disabled,
  sending,
  placeholder,
  onSend,
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || disabled || sending) {
      return;
    }
    setError(null);
    if (await onSend({ content: trimmed, files })) {
      setValue("");
      setFiles([]);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (next.length === 0) {
      return;
    }
    const oversized = next.find((file) => file.size > CHAT_FILE_MAX_BYTES);
    if (oversized) {
      setError("파일 용량은 10MB 이하여야 합니다.");
      return;
    }
    setFiles((current) => {
      const merged = [...current, ...next].slice(0, CHAT_FILE_MAX_COUNT);
      if (current.length + next.length > CHAT_FILE_MAX_COUNT) {
        setError(`파일은 최대 ${CHAT_FILE_MAX_COUNT}개까지 보낼 수 있습니다.`);
      } else {
        setError(null);
      }
      return merged;
    });
  };

  return (
    <form
      className="border-t border-line-light bg-surface-default p-3"
      onSubmit={handleSubmit}
    >
      {files.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-blue-ice px-2 py-1 text-caption-sm text-text-primary"
              key={`${file.name}-${file.size}-${index}`}
            >
              <span className="truncate">{file.name}</span>
              <button
                aria-label={`${file.name} 첨부 취소`}
                className="grid size-4 place-items-center text-text-secondary hover:text-text-primary"
                onClick={() =>
                  setFiles((current) =>
                    current.filter((_, fileIndex) => fileIndex !== index)
                  )
                }
                type="button"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="mb-2 text-caption-sm text-status-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <input
          className="sr-only"
          disabled={disabled || sending}
          multiple
          onChange={addFiles}
          ref={inputRef}
          type="file"
        />
        <button
          aria-label="파일 첨부"
          className="grid size-11 shrink-0 place-items-center rounded-md border border-line-default text-text-secondary transition hover:bg-surface-page disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled || sending}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Paperclip aria-hidden="true" className="size-4" />
        </button>
        <label className="sr-only" htmlFor="chat-message-input">
          메시지 입력
        </label>
        <textarea
          className="max-h-32 min-h-11 flex-1 resize-none rounded-md border border-line-default bg-surface-page px-3 py-2.5 text-body-sm text-text-primary outline-none placeholder:text-text-disabled focus:border-brand-primary disabled:cursor-not-allowed disabled:bg-surface-page"
          disabled={disabled}
          id="chat-message-input"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          value={value}
        />
        <button
          aria-label="보내기"
          className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-primary text-text-inverse transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-brand-primary/40"
          disabled={
            disabled || sending || (!value.trim() && files.length === 0)
          }
          type="submit"
        >
          <Send aria-hidden="true" className="size-4" />
        </button>
      </div>
    </form>
  );
}
