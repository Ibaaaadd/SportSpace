"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-text-primary">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative z-10 flex h-full w-[80vw] max-w-xs flex-col bg-ink p-4">
            <div className="flex items-center justify-between px-1 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                  Menu
                </p>
                <p className="text-lg font-semibold">Control Center</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-secondary"
                aria-label="Close menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>
            <Sidebar
              variant="drawer"
              onItemClick={() => setMenuOpen(false)}
              className="border-none bg-transparent p-0 shadow-none"
            />
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-6 sm:px-6">
        <Sidebar />
        <main className="min-h-[70vh] flex-1 rounded-3xl border border-border bg-surface/70 p-6 shadow-[0_0_24px_rgba(0,0,0,0.25)]">
          {children}
        </main>
      </div>
    </div>
  );
}
