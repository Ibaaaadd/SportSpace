import type { ReactNode } from "react";
import Link from "next/link";

export type SidebarItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

type SidebarProps = {
  items?: SidebarItem[];
  variant?: "desktop" | "drawer";
  onItemClick?: () => void;
  className?: string;
};

const fallbackItems: SidebarItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Bookings", href: "/transaction/bookings" },
  { label: "Payments", href: "/transaction/payments" },
  { label: "Venues", href: "/master/venues" },
  { label: "Pricing", href: "/master/pricing" },
  { label: "Users", href: "/setup/users" },
];

export default function Sidebar({
  items = fallbackItems,
  variant = "desktop",
  onItemClick,
  className,
}: SidebarProps) {
  const isDesktop = variant === "desktop";

  return (
    <aside
      className={`${
        isDesktop
          ? "hidden w-64 shrink-0 lg:sticky lg:top-24 lg:flex"
          : "flex w-full max-w-xs"
      } flex-col gap-4 rounded-3xl border border-border bg-surface/80 p-5 shadow-[0_0_24px_rgba(0,0,0,0.25)] ${
        className ?? ""
      }`}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
          Menu
        </p>
        <h2 className="mt-2 text-lg font-semibold">Control Center</h2>
      </div>
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-text-muted transition hover:border-border hover:bg-ink-2 hover:text-text-primary"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-secondary/60" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-border bg-ink-2 px-4 py-3 text-xs text-text-muted">
        Tips: gunakan filter untuk cek jadwal yang bentrok lebih cepat.
      </div>
    </aside>
  );
}
