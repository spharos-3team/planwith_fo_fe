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
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  size?: "md" | "lg";
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  description,
  closeOnOverlayClick = true,
  showCloseButton = true,
  size = "md",
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
    if (closeOnOverlayClick && event.target === event.currentTarget) {
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
        className={`w-full rounded-lg bg-surface-default p-card shadow-landmark outline-none ${
          size === "lg" ? "max-w-[520px]" : "max-w-md"
        }`}
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
          {showCloseButton ? (
            <button
              aria-label="닫기"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-text-secondary transition hover:bg-surface-page hover:text-text-primary"
              onClick={onClose}
              type="button"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
