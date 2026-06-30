// @ts-nocheck
"use client";

import { useCallback, useEffect, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/Card";
import Toggle from "../../../../components/ui/Toggle";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type PermKey = "view" | "create" | "edit" | "delete";

type RolePerms = Record<PermKey, boolean>;

type Menu = {
  id: string;
  label: string;
  icon: string;
  href: string;
  parentId: string | null;
  order: number;
  isGroup: boolean;
  access: Record<string, RolePerms>;
  isActive: boolean;
};

type View = "list" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES_LIST = ["admin", "operator", "kasir", "member"];

const ROLE_META: Record<string, { label: string; variant: "info" | "success" | "warning" | "muted" }> = {
  admin:    { label: "Admin",    variant: "info" },
  operator: { label: "Operator", variant: "success" },
  kasir:    { label: "Kasir",    variant: "warning" },
  member:   { label: "Member",   variant: "muted" },
};

const PERMS: { key: PermKey; label: string }[] = [
  { key: "view",   label: "Lihat" },
  { key: "create", label: "Buat" },
  { key: "edit",   label: "Edit" },
  { key: "delete", label: "Hapus" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function MenuIcon({ name, className = "h-3.5 w-3.5 shrink-0" }: { name: string; className?: string }) {
  switch (name) {
    case "dashboard": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    );
    case "calendar": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
    );
    case "payment": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
      </svg>
    );
    case "database": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
      </svg>
    );
    case "tag": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      </svg>
    );
    case "pin": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    );
    case "dollar": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    );
    case "chart": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    );
    case "activity": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    );
    case "trending": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    );
    case "settings": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    );
    case "users": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    );
    case "shield": return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    );
    default: return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    );
  }
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ─── Sidebar tree (list view) ─────────────────────────────────────────────────

function SidebarTree({
  items,
  onEdit,
}: {
  items: Menu[];
  onEdit: (menu: Menu) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["m-4", "m-8", "m-11"]));

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const roots = items.filter((m) => !m.parentId).sort((a, b) => a.order - b.order);

  function countViewable(menu: Menu) {
    return ROLES_LIST.filter((r) => menu.access[r]?.view).length;
  }

  function renderChild(item: Menu) {
    return (
      <div
        key={item.id}
        className="group flex items-center gap-3 px-4 py-2.5 pl-14 transition-colors hover:bg-surface-2/40"
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.isActive ? "bg-green-400" : "bg-border"}`} />
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2/60 text-text-muted">
          <MenuIcon name={item.icon} />
        </div>
        <span className="flex-1 truncate text-sm text-text-primary">{item.label}</span>
        <span className="text-[10px] font-medium text-text-muted/50">{countViewable(item)} role</span>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary"
          aria-label={`Edit akses ${item.label}`}
        >
          <IconEdit />
        </button>
      </div>
    );
  }

  function renderRoot(item: Menu) {
    const children = items.filter((m) => m.parentId === item.id).sort((a, b) => a.order - b.order);
    const hasChildren = children.length > 0;
    const isExpanded = expanded.has(item.id);

    return (
      <div
        key={item.id}
        className="overflow-hidden rounded-2xl border border-border/70 bg-surface/60 transition-all duration-200 hover:border-border hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="group flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <MenuIcon name={item.icon} className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-text-primary">{item.label}</span>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.isActive ? "bg-green-400" : "bg-border"}`} />
            </div>
            <p className="truncate text-xs text-text-muted/60">{item.href}</p>
          </div>
          <span className="shrink-0 rounded-full bg-surface-2/60 px-2.5 py-1 text-[10px] font-medium text-text-muted">
            {countViewable(item)} role
          </span>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary"
            aria-label={`Edit akses ${item.label}`}
          >
            <IconEdit />
          </button>
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted/60 transition hover:bg-surface-2/60 hover:text-text-muted"
              aria-label={isExpanded ? "Tutup" : "Buka"}
            >
              {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="divide-y divide-border/40 border-t border-border/60">
            {children.map((c) => renderChild(c))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {roots.map((r) => renderRoot(r))}
    </div>
  );
}

// ─── Form page ────────────────────────────────────────────────────────────────

function MenuFormPage({
  menu,
  allMenus,
  onSave,
  onBack,
  saving,
}: {
  menu: Menu;
  allMenus: Menu[];
  onSave: (id: string, access: Record<string, RolePerms>, isActive: boolean) => void;
  onBack: () => void;
  saving: boolean;
}) {
  const [access, setAccess] = useState<Record<string, RolePerms>>(
    () => JSON.parse(JSON.stringify(menu.access)) as Record<string, RolePerms>
  );
  const [isActive, setIsActive] = useState(menu.isActive);

  const parent = allMenus.find((m) => m.id === menu.parentId);

  const visiblePerms = menu.isGroup ? PERMS.filter((p) => p.key === "view") : PERMS;

  function toggle(role: string, key: PermKey) {
    setAccess((prev) => {
      const next = { ...prev, [role]: { ...prev[role], [key]: !prev[role][key] } };
      if (key === "view" && !next[role].view) {
        next[role] = { view: false, create: false, edit: false, delete: false };
      }
      if (key !== "view" && next[role][key]) {
        next[role] = { ...next[role], view: true };
      }
      return next;
    });
  }

  function toggleAllForRole(role: string, checked: boolean) {
    setAccess((prev) => ({
      ...prev,
      [role]: checked
        ? { view: true, create: !menu.isGroup, edit: !menu.isGroup, delete: !menu.isGroup }
        : { view: false, create: false, edit: false, delete: false },
    }));
  }

  function toggleAllForPerm(key: PermKey, checked: boolean) {
    setAccess((prev) => {
      const next = { ...prev };
      for (const role of ROLES_LIST) {
        next[role] = { ...next[role], [key]: checked };
        if (checked && key !== "view") next[role].view = true;
        if (!checked && key === "view") {
          next[role] = { view: false, create: false, edit: false, delete: false };
        }
      }
      return next;
    });
  }

  function handleSave() {
    onSave(menu.id, access, isActive);
  }

  const totalActive = ROLES_LIST.filter((r) => access[r]?.view).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 text-text-muted transition hover:border-border hover:text-text-primary"
            aria-label="Kembali"
          >
            <IconBack />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Akses Menu — {menu.label}
            </h1>
            <p className="text-sm text-text-muted">
              Atur operasi yang diizinkan per role untuk menu ini.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>Batal</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left — menu info + status */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Info Menu</CardTitle>
              <CardDescription>Detail menu (tidak dapat diubah).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted">
                  <MenuIcon name={menu.icon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{menu.label}</p>
                  {parent && (
                    <p className="text-xs text-text-muted">dalam {parent.label}</p>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-ink-2/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-widest text-text-muted">Path</p>
                <p className="mt-0.5 font-mono text-xs text-text-primary">{menu.href}</p>
              </div>
              {menu.isGroup && (
                <p className="rounded-lg border border-yellow-400/20 bg-yellow-400/5 px-3 py-2 text-xs text-yellow-300">
                  Menu grup — hanya visibilitas yang dapat diatur (tidak ada CRUD).
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Ringkasan</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{totalActive}</p>
            <p className="text-xs text-text-muted">dari {ROLES_LIST.length} role dapat mengakses menu ini</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2/60">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${(totalActive / ROLES_LIST.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Active toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Status Menu</CardTitle>
              <CardDescription>Menu nonaktif tidak muncul di sidebar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isActive ? "text-green-400" : "text-text-muted"}`}>
                    {isActive ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {isActive ? "Tampil di navigasi." : "Disembunyikan dari navigasi."}
                  </p>
                </div>
                <Toggle checked={isActive} onCheckedChange={setIsActive} label="Status menu" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — permission matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Matriks Izin Akses</CardTitle>
            <CardDescription>
              {menu.isGroup
                ? "Centang role yang dapat melihat grup menu ini di sidebar."
                : "Tentukan operasi yang diizinkan per role untuk menu ini."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Role
                    </th>
                    {visiblePerms.map((p) => {
                      const allChecked = ROLES_LIST.every((r) => access[r]?.[p.key]);
                      return (
                        <th key={p.key} className="pb-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                              {p.label}
                            </span>
                            <input
                              type="checkbox"
                              checked={allChecked}
                              onChange={(e) => toggleAllForPerm(p.key, e.target.checked)}
                              className="h-3.5 w-3.5 rounded border-border accent-secondary"
                              title={`Toggle semua ${p.label}`}
                            />
                          </div>
                        </th>
                      );
                    })}
                    <th className="pb-3 text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
                      Semua
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {ROLES_LIST.map((role) => {
                    const meta = ROLE_META[role];
                    const rowPerms = access[role] ?? { view: false, create: false, edit: false, delete: false };
                    const allRowChecked = visiblePerms.every((p) => rowPerms[p.key]);
                    return (
                      <tr key={role} className="group transition-colors hover:bg-surface-2/30">
                        <td className="py-3 pr-4">
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </td>
                        {visiblePerms.map((p) => {
                          const isDisabled = p.key !== "view" && !rowPerms.view;
                          return (
                            <td key={p.key} className="py-3 text-center">
                              <input
                                type="checkbox"
                                checked={rowPerms[p.key]}
                                disabled={isDisabled}
                                onChange={() => toggle(role, p.key)}
                                className="h-4 w-4 rounded border-border accent-secondary disabled:cursor-not-allowed disabled:opacity-30"
                              />
                            </td>
                          );
                        })}
                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={allRowChecked}
                            onChange={(e) => toggleAllForRole(role, e.target.checked)}
                            className="h-4 w-4 rounded border-border accent-secondary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!menu.isGroup && (
              <p className="mt-4 text-xs text-text-muted/60">
                Kolom Buat / Edit / Hapus otomatis memerlukan Lihat. Jika Lihat dinonaktifkan, semua izin ikut nonaktif.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function MenusContent() {
  const { push } = useToast();
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<Menu[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<Menu | null>(null);

  const loadMenus = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/menus");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data);
    } catch {
      setFetchError("Gagal memuat data menu. Coba refresh.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadMenus(); }, [loadMenus]);

  function openEdit(menu: Menu) {
    setEditTarget(menu);
    setView("form");
  }

  async function handleSave(id: string, access: Record<string, RolePerms>, isActive: boolean) {
    const menu = items.find((m) => m.id === id);
    setSaving(true);
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access, isActive }),
      });
      if (!res.ok) throw new Error();
      const updated: Menu = await res.json();
      setItems((prev) => prev.map((m) => (m.id === id ? updated : m)));
      push({ title: "Akses disimpan", description: `Pengaturan "${menu?.label ?? updated.label}" berhasil diperbarui.`, variant: "success" });
      setView("list");
    } catch {
      push({ title: "Gagal menyimpan", description: `Pengaturan "${menu?.label}" tidak tersimpan.`, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  // ── Form view ──
  if (view === "form" && editTarget) {
    return (
      <MenuFormPage
        menu={editTarget}
        allMenus={items}
        onSave={handleSave}
        onBack={() => setView("list")}
        saving={saving}
      />
    );
  }

  // ── Loading / error states ──
  if (fetching) {
    return <p className="text-sm text-text-muted">Memuat data menu...</p>;
  }
  if (fetchError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-red-400">{fetchError}</p>
        <Button variant="ghost" size="sm" onClick={loadMenus}>Coba lagi</Button>
      </div>
    );
  }

  // ── List view ──
  const totalActive = items.filter((i) => i.isActive).length;
  const totalRestricted = items.filter((i) => ROLES_LIST.some((r) => !i.access[r]?.view)).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-text-muted">Setup</p>
        <h1 className="text-xl font-bold text-text-primary">Manajemen Akses Menu</h1>
        <p className="mt-0.5 text-sm text-text-muted">
          Atur visibilitas dan izin CRUD setiap menu per role pengguna.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Menu",     value: items.length,                color: "text-text-primary" },
          { label: "Menu Aktif",     value: totalActive,                 color: "text-green-400" },
          { label: "Menu Nonaktif",  value: items.length - totalActive,  color: "text-text-muted" },
          { label: "Akses Dibatasi", value: totalRestricted,             color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`mt-0.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sidebar tree */}
      <div>
        <h2 className="text-base font-semibold tracking-tight text-text-primary">Navigasi Sidebar</h2>
        <p className="mt-1 text-sm text-text-muted">
          Hover pada menu lalu klik ikon edit untuk mengatur akses dan izin CRUD-nya.
        </p>
      </div>
      <SidebarTree items={items} onEdit={openEdit} />

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface/40 px-4 py-3">
        <p className="text-xs font-semibold text-text-muted">Keterangan:</p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-text-muted">Menu aktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
          <span className="text-xs text-text-muted">Menu nonaktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">N role</span>
          <span className="text-xs text-text-muted/60">= jumlah role yang bisa lihat menu</span>
        </div>
      </div>
    </div>
  );
}

export default function MenusPage() {
  return (
    <ToastProvider>
      <MenusContent />
    </ToastProvider>
  );
}
