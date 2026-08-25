"use client";

import { AlertTriangle, Check } from "lucide-react";
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/Button";

type ModalAction = {
  label: string;
  onClick: () => void;
};

type ModalBase = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  appearance?: "dark" | "glass";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showIcon?: boolean;
};

export type AlertModalProps = ModalBase & {
  variant: "alert";
  confirmAction: ModalAction;
};

export type ConfirmModalProps = ModalBase & {
  variant: "confirm";
  cancelAction: ModalAction;
  confirmAction: ModalAction;
  confirmTone?: "primary" | "danger";
  detail?: ReactNode;
};

export type SuccessModalProps = ModalBase & {
  variant: "success";
  detail?: ReactNode;
  primaryAction: ModalAction;
  secondaryAction?: ModalAction;
};

export type ModalProps =
  AlertModalProps | ConfirmModalProps | SuccessModalProps;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );
}

function useModalLayer({
  open,
  onClose,
  closeOnEscape = true,
  panelRef,
  initialFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
}) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = getFocusableElements(panelRef.current);

      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          activeElement === panelRef.current
        ) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (initialFocusRef.current) {
        initialFocusRef.current.focus();
        return;
      }

      panelRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
  }, [closeOnEscape, initialFocusRef, onClose, open, panelRef]);
}

function ModalIcon({ variant }: { variant: ModalProps["variant"] }) {
  if (variant === "confirm") {
    return (
      <div
        aria-hidden="true"
        className="mx-auto mb-stack grid size-14 place-items-center rounded-circle bg-status-warning-bg text-status-error"
      >
        <AlertTriangle className="h-7 w-7" strokeWidth={2.25} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="mx-auto mb-stack grid size-14 place-items-center rounded-circle bg-brand-primary text-text-inverse shadow-[var(--icon-success-glow)]"
    >
      <Check className="h-7 w-7" strokeWidth={2.5} />
    </div>
  );
}

function ModalActions({
  props,
  initialFocusRef,
}: {
  props: ModalProps;
  initialFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  if (props.variant === "alert") {
    return (
      <div className="mt-stack w-full">
        <Button
          className="w-full"
          onClick={props.confirmAction.onClick}
          ref={initialFocusRef}
          size="md"
        >
          {props.confirmAction.label}
        </Button>
      </div>
    );
  }

  if (props.variant === "confirm") {
    return (
      <div className="mt-stack flex w-full gap-2">
        <Button
          buttonStyle="inverse"
          className="flex-1 border border-line-light"
          onClick={props.cancelAction.onClick}
          size="md"
        >
          {props.cancelAction.label}
        </Button>
        <Button
          buttonStyle={props.confirmTone === "primary" ? "primary" : "danger"}
          className="flex-1"
          onClick={props.confirmAction.onClick}
          ref={initialFocusRef}
          size="md"
        >
          {props.confirmAction.label}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-stack flex w-full flex-col items-center gap-3">
      <Button
        className="w-full"
        onClick={props.primaryAction.onClick}
        ref={initialFocusRef}
        size="md"
      >
        {props.primaryAction.label}
      </Button>
      {props.secondaryAction ? (
        <button
          className="text-body-sm text-text-disabled transition hover:text-text-secondary"
          onClick={props.secondaryAction.onClick}
          type="button"
        >
          {props.secondaryAction.label}
        </button>
      ) : null}
    </div>
  );
}

export function Modal(props: ModalProps): ReactElement | null {
  const {
    open,
    onClose,
    title,
    description,
    variant,
    appearance = variant === "success" ? "glass" : "dark",
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showIcon = true,
  } = props;

  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  useModalLayer({
    closeOnEscape,
    initialFocusRef,
    onClose,
    open,
    panelRef,
  });

  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const panelClass =
    appearance === "glass"
      ? "w-full max-w-[440px] rounded-xl border border-line-light bg-surface-default p-8 text-center shadow-landmark outline-none"
      : "w-full max-w-[340px] rounded-xl border border-white/10 bg-surface-modal-dark p-8 text-center outline-none backdrop-blur-md";

  const titleClass =
    appearance === "glass"
      ? "text-heading-lg text-text-primary"
      : "text-body-lg font-bold text-text-inverse";

  const descriptionMargin =
    variant === "confirm" && props.detail ? "mt-stack" : "mt-2";
  const descriptionClass =
    appearance === "glass"
      ? `${descriptionMargin} whitespace-pre-line text-body-sm text-text-secondary`
      : `${descriptionMargin} whitespace-pre-line text-body-sm text-text-on-dark-muted`;

  return createPortal(
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay-modal p-card backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
    >
      <div
        className={panelClass}
        ref={panelRef}
        tabIndex={-1}
        {...(description ? { "aria-describedby": descriptionId } : {})}
      >
        {showIcon ? <ModalIcon variant={variant} /> : null}
        <h2 className={titleClass} id={titleId}>
          {title}
        </h2>
        {variant === "confirm" && props.detail ? (
          <div className="mt-stack rounded-lg bg-blue-ice/70 px-4 py-3 text-left">
            {props.detail}
          </div>
        ) : null}
        {description ? (
          <p className={descriptionClass} id={descriptionId}>
            {description}
          </p>
        ) : null}
        {variant === "success" && props.detail ? (
          <div className="mt-stack rounded-lg bg-surface-page/80 px-4 py-3 text-left">
            {props.detail}
          </div>
        ) : null}
        <ModalActions initialFocusRef={initialFocusRef} props={props} />
      </div>
    </div>,
    document.body
  );
}
