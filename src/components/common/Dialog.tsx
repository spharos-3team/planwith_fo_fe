"use client";

import { X } from "lucide-react";
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  description,
}: DialogProps): ReactElement | null {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-card"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div
        className="w-full max-w-md rounded-lg bg-surface-default p-card shadow-landmark outline-none"
        ref={panelRef}
        tabIndex={-1}
        {...(description ? { "aria-describedby": descriptionId } : {})}
      >
        <div className="mb-stack flex items-start justify-between gap-stack">
          <div>
            <h2 className="text-heading-md text-text-primary" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p
                className="mt-1 text-body-sm text-text-secondary"
                id={descriptionId}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label="닫기"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-text-secondary transition hover:bg-surface-page hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
