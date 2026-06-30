// @ts-nocheck
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus, Pencil, Trash2, Search, ShieldAlert, Users, Lock } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/Card";
import DataTable, { type Column } from "../../../../components/ui/DataTable";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";
import {
  PERM_GROUPS, PERM_LABEL, permKey, normalizeRole, type RoleItem,
} from "./_data";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, iconBg, iconColor, valueColor }: {
  label: string; value: number;
  Icon: React.ElementType; iconBg: string; iconColor: string; valueColor: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface/60 p-4 transition-all duration-200 hover:border-border hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>{value}</p>
          <p className="mt-1 text-[13px] text-text-muted">{label}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );
}

// ─── List content ─────────────────────────────────────────────────────────────

function RolesListContent() {
  const router = useRouter();
  const { push } = useToast();

  const [roles, setRoles]           = useState<RoleItem[]>([]);
  const [fetching, setFetching]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [permOpen, setPermOpen]     = useState<RoleItem | null>(null);

  const loadRoles = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoles(data.map(normalizeRole));
    } catch {
      setFetchError("Gagal memuat data role. Coba refresh.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const filtered = useMemo(() =>
    roles.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    ),
    [roles, search]
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        push({ title: "Gagal menghapus", description: data.error, variant: "error" });
        return;
      }
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      push({ title: "Role dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
      setDeleteTarget(null);
    } catch {
      push({ title: "Gagal menghapus", description: "Terjadi kesalahan, coba lagi.", variant: "error" });
    } finally {
      setDeleting(false);
    }
  }

  const columns: Column<RoleItem>[] = [
    {
      key: "name",
      header: "Nama Role",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/10 text-secondary">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
          </div>
          <div>
            <span className="font-medium text-text-primary">{row.name}</span>
            {row.isSystem && (
              <span className="ml-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary">
                system
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (row) => <span className="text-sm text-text-muted">{row.description || "—"}</span>,
    },
    {
      key: "permissions",
      header: "Izin",
      align: "center",
      render: (row) => (
        <button
          type="button"
          onClick={() => setPermOpen(row)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1 text-xs text-text-muted transition hover:border-secondary/50 hover:text-secondary"
        >
          <Lock className="h-3 w-3" strokeWidth={1.8} />
          {row.permissions.length} izin
        </button>
      ),
    },
    {
      key: "userCount",
      header: "Pengguna",
      align: "center",
      render: (row) => <Badge variant="muted">{row.userCount} user</Badge>,
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => router.push(`/setup/roles/${row.id}/edit`)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-secondary/50 hover:bg-secondary/8 hover:text-secondary"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            disabled={row.isSystem}
            onClick={() => !row.isSystem && setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-red-500/50 hover:bg-red-500/8 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Hapus"
            title={row.isSystem ? "Role system tidak dapat dihapus" : "Hapus"}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    { label: "Total Role",     value: roles.length,                               Icon: ShieldCheck, iconBg: "bg-primary/15",   iconColor: "text-primary",   valueColor: "text-text-primary" },
    { label: "Role System",    value: roles.filter((r) => r.isSystem).length,     Icon: ShieldAlert, iconBg: "bg-secondary/15", iconColor: "text-secondary", valueColor: "text-secondary" },
    { label: "Role Custom",    value: roles.filter((r) => !r.isSystem).length,    Icon: ShieldCheck, iconBg: "bg-accent/12",    iconColor: "text-accent",    valueColor: "text-accent" },
    { label: "Total Pengguna", value: roles.reduce((a, r) => a + r.userCount, 0), Icon: Users,       iconBg: "bg-green-500/12", iconColor: "text-green-400", valueColor: "text-green-400" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/50">Setup</p>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Manajemen Role</h1>
          <p className="mt-0.5 text-sm text-text-muted">Atur hak akses dan izin untuk setiap peran pengguna.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
          onClick={() => router.push("/setup/roles/create")}
        >
          Tambah Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">
          {fetchError}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Role</CardTitle>
              <CardDescription>{filtered.length} dari {roles.length} role</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input
                placeholder="Cari nama atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-3.5 w-3.5" strokeWidth={1.8} />}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="Tidak ada role ditemukan."
            loading={fetching}
            onRefresh={loadRoles}
          />
        </CardContent>
      </Card>

      {/* View permissions modal — read-only, tetap modal karena tidak ada form */}
      <Modal
        open={!!permOpen}
        variant="default"
        title={`Izin — ${permOpen?.name ?? ""}`}
        description={`${permOpen?.permissions.length ?? 0} izin aktif`}
        onClose={() => setPermOpen(null)}
        size="md"
        footer={
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setPermOpen(null)}>Tutup</Button>
          </div>
        }
      >
        {permOpen && (
          <div className="flex flex-col gap-3">
            {PERM_GROUPS.map((group) => {
              const active = group.perms.filter((p) => permOpen.permissions.includes(permKey(group.key, p)));
              if (active.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-text-muted">{group.module}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {active.map((p) => (
                      <span key={p} className="inline-flex items-center rounded-lg border border-secondary/40 bg-secondary/10 px-2.5 py-1 text-xs text-secondary">
                        {PERM_LABEL[p] ?? p}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        variant="delete"
        title="Hapus Role"
        onClose={() => !deleting && setDeleteTarget(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={deleting} onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>Hapus</Button>
          </div>
        }
      >
        <p className="text-sm text-text-muted">
          Yakin ingin menghapus role{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
        </p>
        {deleteTarget && deleteTarget.userCount > 0 && (
          <p className="mt-3 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-3 py-2.5 text-xs text-yellow-300">
            Perhatian: {deleteTarget.userCount} pengguna masih menggunakan role ini.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default function RolesPage() {
  return <ToastProvider><RolesListContent /></ToastProvider>;
}
