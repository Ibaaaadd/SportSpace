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

const variantConfig: Record<ToastVariant, { border: string; icon: ReactNode; dot: string }> = {
  info: {
    border: "border-secondary/50",
    dot: "bg-secondary",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  success: {
    border: "border-accent/50",
    dot: "bg-accent",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    ),
  },
  warning: {
    border: "border-yellow-400/50",
    dot: "bg-yellow-400",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    ),
  },
  error: {
    border: "border-red-500/50",
    dot: "bg-red-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMap = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    if (timeoutMap.current[id]) {
      window.clearTimeout(timeoutMap.current[id]);
      delete timeoutMap.current[id];
    }
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = { id, variant: "info", duration: 4500, ...toast };
      setToasts((current) => [item, ...current].slice(0, 5));
      timeoutMap.current[id] = window.setTimeout(() => dismiss(id), item.duration ?? 4500);
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
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function createToastHelpers(toast: { push: (item: any) => void; dismiss: (id: string) => void }) {
  return {
    success: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'success' as const }),
    error: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'error' as const }),
    info: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'info' as const }),
    warning: (title: string, description?: string) =>
      toast.push({ title, description, variant: 'warning' as const }),
  };
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-60 flex w-[min(360px,90vw)] flex-col gap-2">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant ?? "info"];
        return (
          <div
            key={toast.id}
            className={`overflow-hidden rounded-xl border ${config.border} bg-surface shadow-[0_4px_24px_rgba(0,0,0,0.35)]`}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 shrink-0">{config.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-text-muted">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-md p-0.5 text-text-muted transition hover:text-text-primary"
                aria-label="Dismiss"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>
            <div className={`h-0.5 w-full ${config.dot} opacity-60`} />
          </div>
        );
      })}
    </div>
  );
}
