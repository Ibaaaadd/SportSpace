"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ModalVariant = "default" | "create" | "edit" | "delete";

export type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  variant?: ModalVariant;
};

const sizeStyles = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

// Per-variant: header background, title color, icon
const variantConfig: Record<
  ModalVariant,
  { header: string; title: string; icon: ReactNode; iconWrap: string }
> = {
  default: {
    header: "border-b border-border",
    title: "text-text-primary",
    icon: null,
    iconWrap: "",
  },
  create: {
    header: "border-b border-accent/30 bg-linear-to-r from-accent/10 via-accent/5 to-transparent",
    title: "text-accent",
    iconWrap: "bg-accent/15 text-accent",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  edit: {
    header: "border-b border-secondary/30 bg-linear-to-r from-secondary/10 via-secondary/5 to-transparent",
    title: "text-secondary",
    iconWrap: "bg-secondary/15 text-secondary",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  delete: {
    header: "border-b border-red-500/30 bg-linear-to-r from-red-500/10 via-red-500/5 to-transparent",
    title: "text-red-300",
    iconWrap: "bg-red-500/15 text-red-400",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    ),
  },
};

export default function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  size = "md",
  variant = "default",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!mounted) return null;
  if (!open && !visible) return null;

  const cfg = variantConfig[variant];

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${sizeStyles[size]} overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_48px_rgba(0,0,0,0.5)] transition-all duration-200 ${
          visible ? "translate-y-0 scale-100" : "translate-y-3 scale-95"
        }`}
      >
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-5 ${cfg.header}`}>
          <div className="flex items-start gap-3">
            {/* Icon badge */}
            {cfg.icon && (
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.iconWrap}`}>
                {cfg.icon}
              </div>
            )}
            <div>
              <h2 className={`text-base font-semibold ${cfg.title}`}>{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-text-muted">{description}</p>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-text-primary">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
