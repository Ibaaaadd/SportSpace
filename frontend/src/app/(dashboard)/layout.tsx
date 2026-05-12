import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-ink text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              Admin Workspace
            </p>
            <h1 className="text-2xl font-semibold">Sport Space Admin</h1>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-muted">
            Placeholder layout
          </span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
