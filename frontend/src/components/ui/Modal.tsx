"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Pencil, Trash2 } from "lucide-react";

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

const variantConfig: Record<
  ModalVariant,
  { header: string; title: string; Icon: React.ElementType | null; iconWrap: string }
> = {
  default: {
    header: "border-b border-border/60",
    title: "text-text-primary",
    Icon: null,
    iconWrap: "",
  },
  create: {
    header: "border-b border-accent/25 bg-linear-to-r from-accent/8 to-transparent",
    title: "text-accent",
    iconWrap: "bg-accent/15 text-accent",
    Icon: Plus,
  },
  edit: {
    header: "border-b border-secondary/25 bg-linear-to-r from-secondary/8 to-transparent",
    title: "text-secondary",
    iconWrap: "bg-secondary/15 text-secondary",
    Icon: Pencil,
  },
  delete: {
    header: "border-b border-red-500/25 bg-linear-to-r from-red-500/8 to-transparent",
    title: "text-red-300",
    iconWrap: "bg-red-500/15 text-red-400",
    Icon: Trash2,
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
  const Icon = cfg.Icon;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${sizeStyles[size]} overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-[0_16px_56px_rgba(0,0,0,0.55)] transition-all duration-200 ${
          visible ? "translate-y-0 scale-100" : "translate-y-3 scale-[0.97]"
        }`}
      >
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-5 ${cfg.header}`}>
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.iconWrap}`}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
            )}
            <div>
              <h2 className={`text-base font-semibold tracking-tight ${cfg.title}`}>{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-text-muted">{description}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-border hover:text-text-muted"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-text-primary">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border/60 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
