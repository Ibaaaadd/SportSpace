"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { X } from "lucide-react";
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
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative z-10 flex h-full w-72 flex-col overflow-y-auto bg-ink p-5 shadow-[4px_0_32px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted/60">Navigasi</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 text-text-muted transition hover:border-secondary/60 hover:text-text-primary"
                aria-label="Close menu"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
            <Sidebar variant="drawer" onItemClick={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-screen-2xl gap-6 px-4 pb-14 pt-6 sm:px-6">
        <Sidebar />
        <main className="min-h-[80vh] flex-1 overflow-auto rounded-2xl border border-border/70 bg-surface/50 p-6 shadow-[0_2px_24px_rgba(0,0,0,0.18)]">
          {children}
        </main>
      </div>
    </div>
  );
}
