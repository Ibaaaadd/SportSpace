"use client";

import Image from "next/image";
import ThemeToggle from "../shared/ThemeToggle";
import Button from "../ui/Button";
import { useState } from "react";

type NavbarProps = {
  onOpenMenu?: () => void;
};

export default function Navbar({ onOpenMenu }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Booking BK-4821 menunggu konfirmasi", time: "2m lalu", dot: "bg-secondary" },
    { id: 2, text: "3 pembayaran pending belum diproses", time: "15m lalu", dot: "bg-yellow-400" },
    { id: 3, text: "Lapangan Padel Arena A tersedia kembali", time: "1j lalu", dot: "bg-accent" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-secondary hover:text-text-primary lg:hidden"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
              <Image src="/img/logo.png" alt="Sport Space" width={28} height={28} className="object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-text-primary">Sport Space</p>
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Control Center</p>
            </div>
          </div>
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
          <div className="flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-border bg-surface/60 px-3.5 py-2 text-sm text-text-muted transition focus-within:border-secondary/60 focus-within:bg-surface hover:border-border/80">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Cari booking, venue, member..."
              className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
            />
            <span className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-text-muted sm:block">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right: notif + theme + avatar */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-secondary hover:text-text-primary"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary" />
            </button>

            {notifOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                  aria-label="Close notifications"
                />
                <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">Notifikasi</p>
                    <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                      {notifications.length} baru
                    </span>
                  </div>
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="flex items-start gap-3 px-4 py-3 text-left transition hover:bg-ink-2"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.dot}`} />
                        <div>
                          <p className="text-xs text-text-primary">{n.text}</p>
                          <p className="mt-0.5 text-[10px] text-text-muted">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border px-4 py-2.5">
                    <button type="button" className="text-xs text-secondary hover:underline">
                      Lihat semua notifikasi
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <ThemeToggle />

          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" size="sm">
              New Booking
            </Button>
          </div>

          {/* User avatar */}
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-xs font-bold text-white shadow-[0_0_12px_rgba(27,111,255,0.35)] transition hover:brightness-110"
            aria-label="User menu"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
