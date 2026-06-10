"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type ThemeMode = "dark" | "light";

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem("theme-mode") as ThemeMode | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
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
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-text-muted transition hover:border-secondary/60 hover:bg-surface-2/50 hover:text-text-primary"
      aria-pressed={isLight}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? (
        <Moon className="h-4 w-4" strokeWidth={1.8} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.8} />
      )}
    </button>
  );
}
