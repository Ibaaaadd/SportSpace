"use client";

import { useEffect, useState } from "react";

type ThemeMode = "dark" | "light";

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem("theme-mode") as ThemeMode | null;
  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const isLight = mode === "light";

  useEffect(() => {
    const initial = getInitialTheme();
    setMode(initial);
    applyTheme(initial);
  }, []);

  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    window.localStorage.setItem("theme-mode", next);
    applyTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="relative flex h-10 w-20 items-center rounded-full border border-border bg-ink-2 p-1 transition hover:border-secondary"
      aria-pressed={isLight}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out ${
          isLight ? "translate-x-10" : "translate-x-0"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center transition-transform duration-300 ${
            isLight ? "rotate-0" : "-rotate-90"
          }`}
          aria-hidden="true"
        >
          {isLight ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-accent"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 3.5v2.5M12 18v2.5M4.5 12H2M22 12h-2.5M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z" />
            </svg>
          )}
        </span>
      </span>
      <span className="flex w-full items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
        <span className={isLight ? "text-text-muted" : "text-text-primary"}>
          D
        </span>
        <span className={isLight ? "text-text-primary" : "text-text-muted"}>
          L
        </span>
      </span>
    </button>
  );
}
