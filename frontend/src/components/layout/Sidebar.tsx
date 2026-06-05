"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  Tag,
  Trophy,
  BarChart2,
  TrendingUp,
  Users,
  ShieldCheck,
  MenuSquare,
  LogOut,
  Dumbbell,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    ],
  },
  {
    title: "Transaksi",
    items: [
      { label: "Bookings", href: "/transaction/bookings", icon: Calendar },
      { label: "Payments", href: "/transaction/payments", icon: CreditCard },
      { label: "Waiting List", href: "/transaction/waiting-list", icon: Clock },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Venues", href: "/master/venues", icon: MapPin },
      { label: "Pricing", href: "/master/pricing", icon: Tag },
      { label: "Sport Types", href: "/master/sport-types", icon: Trophy },
    ],
  },
  {
    title: "Laporan",
    items: [
      { label: "Occupancy", href: "/report/occupancy", icon: BarChart2 },
      { label: "Revenue", href: "/report/revenue", icon: TrendingUp },
    ],
  },
  {
    title: "Setup",
    items: [
      { label: "Users", href: "/setup/users", icon: Users },
      { label: "Roles", href: "/setup/roles", icon: ShieldCheck },
      { label: "Menus", href: "/setup/menus", icon: MenuSquare },
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
          ? "hidden w-60 shrink-0 lg:sticky lg:top-20 lg:flex"
          : "flex w-full max-w-xs"
      } flex-col ${className ?? ""}`}
    >
      {/* Brand — only in drawer */}
      {!isDesktop && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border/60 bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary shadow-[0_0_16px_rgba(27,111,255,0.4)]">
            <Dumbbell className="h-4.5 w-4.5 text-white" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-text-primary">Sport Space</p>
            <p className="text-[10px] text-text-muted">Admin Panel</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.22em] text-text-muted/45">
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-linear-to-r from-primary/18 to-secondary/6 text-text-primary shadow-[inset_0_0_0_1px_rgba(27,111,255,0.2)]"
                        : "text-text-muted hover:bg-surface-2/50 hover:text-text-primary"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-linear-to-b from-primary to-secondary" />
                    )}
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                        isActive
                          ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(27,111,255,0.2)]"
                          : "bg-surface-2/60 text-text-muted/70 group-hover:bg-surface-2 group-hover:text-text-primary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.2 : 1.8} />
                    </span>
                    <span className="tracking-[-0.01em]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-surface-2/40">
        <div className="flex items-center gap-3 p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary text-xs font-bold text-white shadow-[0_0_14px_rgba(27,111,255,0.3)]">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-tight text-text-primary">Admin</p>
            <p className="truncate text-[11px] text-text-muted">Operator</p>
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted/60 transition hover:bg-surface-2 hover:text-text-muted"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </aside>
  );
}
