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

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative z-10 flex h-full w-72 flex-col overflow-y-auto bg-ink p-5 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Navigasi</p>
                <p className="mt-0.5 text-sm font-semibold">Control Center</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-secondary hover:text-text-primary"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>
            </div>
            <Sidebar variant="drawer" onItemClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-screen-2xl gap-6 px-4 pb-12 pt-6 sm:px-6">
        <Sidebar />
        <main className="min-h-[80vh] flex-1 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          {children}
        </main>
      </div>
    </div>
  );
}
