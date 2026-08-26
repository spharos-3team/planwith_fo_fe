"use client";

import { Send } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useState } from "react";

interface ChatComposerProps {
  disabled: boolean;
  sending: boolean;
  placeholder: string;
  onSend: (content: string) => boolean;
}

export function ChatComposer({
  disabled,
  sending,
  placeholder,
  onSend,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) {
      return;
    }
    if (onSend(trimmed)) {
      setValue("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      className="flex items-end gap-2 border-t border-line-light bg-surface-default p-3"
      onSubmit={handleSubmit}
    >
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
        disabled={disabled || sending || !value.trim()}
        type="submit"
      >
        <Send aria-hidden="true" className="size-4" />
      </button>
    </form>
  );
}
