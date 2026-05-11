import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-ink text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        <header className="text-sm uppercase tracking-[0.2em] text-text-muted">
          Sport Space Auth
        </header>
        <main className="mt-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
