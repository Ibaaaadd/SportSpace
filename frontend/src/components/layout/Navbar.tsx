"use client";

import Image from "next/image";
import ThemeToggle from "../shared/ThemeToggle";
import Button from "../ui/Button";

type NavbarProps = {
  onOpenMenu?: () => void;
};

export default function Navbar({ onOpenMenu }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-secondary lg:hidden"
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image src="/img/logo.png" alt="Sport Space" width={40} height={40} />
          <div className="leading-tight">
            <p className="text-base font-semibold">Sport Space</p>
            <p className="text-xs text-text-muted">Dashboard</p>
          </div>
        </div>
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm text-text-muted">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <span>Search bookings, venues, members...</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Operator
          </Button>
          <Button variant="primary" size="sm">
            New Booking
          </Button>
        </div>
      </div>
    </header>
  );
}
