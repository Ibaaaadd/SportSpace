"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconCreditCard() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 1 1 14 0c0 5-7 12.5-7 12.5z" />
      <circle cx="12" cy="8.5" r="2.5" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M17 3h3v4a5 5 0 0 1-3 4.6M7 3H4v4a5 5 0 0 0 3 4.6" />
      <path d="M7 3a5 5 0 0 0 5 8 5 5 0 0 0 5-8H7z" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 4-8" />
    </svg>
  );
}

function IconTrendingUp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l5-5 4 4 9-10" />
      <path d="M14 6h7v7" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  );
}

const navGroups: NavGroup[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <IconGrid /> },
    ],
  },
  {
    title: "Transaksi",
    items: [
      { label: "Bookings", href: "/transaction/bookings", icon: <IconCalendar /> },
      { label: "Payments", href: "/transaction/payments", icon: <IconCreditCard /> },
      { label: "Waiting List", href: "/transaction/waiting-list", icon: <IconClock /> },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Venues", href: "/master/venues", icon: <IconMapPin /> },
      { label: "Pricing", href: "/master/pricing", icon: <IconTag /> },
      { label: "Sport Types", href: "/master/sport-types", icon: <IconTrophy /> },
    ],
  },
  {
    title: "Laporan",
    items: [
      { label: "Occupancy", href: "/report/occupancy", icon: <IconBarChart /> },
      { label: "Revenue", href: "/report/revenue", icon: <IconTrendingUp /> },
    ],
  },
  {
    title: "Setup",
    items: [
      { label: "Users", href: "/setup/users", icon: <IconUsers /> },
      { label: "Roles", href: "/setup/roles", icon: <IconShield /> },
      { label: "Menus", href: "/setup/menus", icon: <IconMenu /> },
    ],
  },
];

export type SidebarItem = NavItem;

type SidebarProps = {
  variant?: "desktop" | "drawer";
  onItemClick?: () => void;
  className?: string;
};

export default function Sidebar({ variant = "desktop", onItemClick, className }: SidebarProps) {
  const pathname = usePathname();
  const isDesktop = variant === "desktop";

  return (
    <aside
      className={`${
        isDesktop
          ? "hidden w-60 shrink-0 lg:sticky lg:top-22 lg:flex"
          : "flex w-full max-w-xs"
      } flex-col gap-2 ${className ?? ""}`}
    >
      <nav className="flex flex-col gap-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted/60">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-linear-to-r from-primary/20 to-secondary/5 text-text-primary shadow-[inset_0_0_0_1px_rgba(27,111,255,0.25)]"
                        : "text-text-muted hover:bg-surface-2/60 hover:text-text-primary"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-ink-2 text-text-muted group-hover:bg-surface-2 group-hover:text-text-primary"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-border/60 bg-linear-to-br from-primary/10 to-secondary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-xs font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">Admin</p>
            <p className="truncate text-xs text-text-muted">Operator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
