"use client";

import Image from "next/image";
import ThemeToggle from "../shared/ThemeToggle";
import Button from "../ui/Button";
import { useState } from "react";
import { Search, Bell, Menu, Plus, X } from "lucide-react";

type NavbarProps = {
  onOpenMenu?: () => void;
};

export default function Navbar({ onOpenMenu }: NavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: "Booking BK-4821 menunggu konfirmasi", time: "2m lalu", color: "bg-secondary" },
    { id: 2, text: "3 pembayaran pending belum diproses", time: "15m lalu", color: "bg-yellow-400" },
    { id: 3, text: "Lapangan Padel Arena A tersedia kembali", time: "1j lalu", color: "bg-accent" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-text-muted transition hover:border-secondary/60 hover:bg-surface-2/50 hover:text-text-primary lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" strokeWidth={1.8} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-surface shadow-[0_0_12px_rgba(27,111,255,0.12)]">
              <Image src="/img/logo.png" alt="Sport Space" width={24} height={24} className="object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-text-primary">Sport Space</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted/70">Control Center</p>
            </div>
          </div>
        </div>

        {/* Center: search */}
        <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
          <div className="flex w-full max-w-[400px] items-center gap-2.5 rounded-xl border border-border/70 bg-surface/50 px-3.5 py-2 text-sm transition-all duration-150 focus-within:border-primary/40 focus-within:bg-surface focus-within:shadow-[0_0_0_3px_rgba(27,111,255,0.08)] hover:border-border">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted/60" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Cari booking, venue, member..."
              className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted/50"
            />
            <kbd className="hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-border/60 bg-ink-2/80 px-1.5 py-0.5 text-[10px] font-medium text-text-muted/60 sm:flex">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Notification bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 text-text-muted transition hover:border-secondary/60 hover:bg-surface-2/50 hover:text-text-primary"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.8} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-secondary shadow-[0_0_6px_rgba(0,184,255,0.7)]" />
            </button>

            {notifOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  onClick={() => setNotifOpen(false)}
                  aria-label="Close notifications"
                />
                <div className="absolute right-0 top-10 z-20 w-80 overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-text-primary">Notifikasi</p>
                      <p className="text-[11px] text-text-muted">{notifications.length} belum dibaca</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted/60 hover:text-text-muted"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="flex items-start gap-3 px-4 py-3 text-left transition hover:bg-ink-2/80"
                      >
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full shadow-sm ${n.color}`} />
                        <div>
                          <p className="text-[13px] leading-snug text-text-primary">{n.text}</p>
                          <p className="mt-0.5 text-[11px] text-text-muted">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border/60 px-4 py-2.5">
                    <button type="button" className="text-xs font-medium text-secondary hover:underline">
                      Lihat semua notifikasi →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <ThemeToggle />

          <div className="hidden items-center sm:flex">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}>
              New Booking
            </Button>
          </div>

          {/* User avatar */}
          <button
            type="button"
            className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-secondary text-xs font-bold text-white shadow-[0_0_14px_rgba(27,111,255,0.35)] transition hover:brightness-110"
            aria-label="User menu"
          >
            A
          </button>
        </div>
      </div>
    </header>
  );
}
