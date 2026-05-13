"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-surface/90 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-text-muted">{description}</p>
          ) : null}
        </div>
        <div className="px-6 py-5 text-sm text-text-primary">
          {children}
        </div>
        {footer ? (
          <div className="border-t border-border px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
