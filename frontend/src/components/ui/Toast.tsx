"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  info: "border-secondary/60 bg-surface",
  success: "border-accent/70 bg-surface",
  warning: "border-yellow-400/60 bg-surface",
  error: "border-red-500/60 bg-surface",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMap = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timeoutMap.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete timeoutMap.current[id];
    }
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = {
        id,
        variant: "info",
        duration: 4500,
        ...toast,
      };

      setToasts((current) => [item, ...current]);

      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, item.duration ?? 4500);

      timeoutMap.current[id] = timeoutId;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-6 top-6 z-50 flex w-[min(360px,90vw)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-[0_0_24px_rgba(0,0,0,0.3)] ${
            variantStyles[toast.variant ?? "info"]
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-1 text-xs text-text-muted">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-text-muted transition hover:text-text-primary"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss toast"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
