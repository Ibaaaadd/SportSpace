"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, ShieldCheck, UserCog, UserCheck,
  Search, Plus, Key, Pencil, Trash2,
} from "lucide-react";
import Avatar from "../../../../components/ui/Avatar";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../../../../components/ui/Card";
import DataTable, { type Column } from "../../../../components/ui/DataTable";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import Select from "../../../../components/ui/Select";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";
import { getRoleBadgeVariant, formatDate, normalizeUser, toRoleOptions, type UserItem } from "./_data";

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: number;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
};

function StatCard({ label, value, Icon, iconBg, iconColor, valueColor }: StatCardProps) {
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

function UsersListContent() {
  const router = useRouter();
  const { push } = useToast();

  const [users, setUsers]               = useState<UserItem[]>([]);
  const [roles, setRoles]               = useState<{ id: string; name: string }[]>([]);
  const [fetching, setFetching]         = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [filterRole, setFilterRole]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const loadUsers = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setUsers(data.map(normalizeUser));
    } catch {
      setFetchError("Gagal memuat data user. Coba refresh.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch(() => setRoles([]));
  }, []);

  const filtered = useMemo(() =>
    users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole   = filterRole   ? u.roleId === filterRole : true;
      const matchStatus = filterStatus ? u.status === filterStatus : true;
      return matchSearch && matchRole && matchStatus;
    }),
    [users, search, filterRole, filterStatus]
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      push({ title: "User dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
      setDeleteTarget(null);
    } catch {
      push({ title: "Gagal menghapus", description: "Terjadi kesalahan, coba lagi.", variant: "error" });
    } finally {
      setDeleting(false);
    }
  }

  function handleResetPassword(u: UserItem) {
    push({ title: "Reset password dikirim", description: `Link reset dikirim ke ${u.email}.`, variant: "info" });
  }

  const columns: Column<UserItem>[] = [
    {
      key: "name",
      header: "Pengguna",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" online={row.status === "active"} />
          <div>
            <p className="font-medium leading-tight text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Telepon",
      render: (row) => <span className="text-sm text-text-muted">{row.phone || "—"}</span>,
    },
    {
      key: "role",
      header: "Role",
      align: "center",
      render: (row) => (
        <Badge variant={getRoleBadgeVariant(row.roleName)}>{row.roleName}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) =>
        row.status === "active"
          ? <Badge variant="success" dot>Aktif</Badge>
          : <Badge variant="muted" dot>Nonaktif</Badge>,
    },
    {
      key: "lastActive",
      header: "Aktif Terakhir",
      render: (row) => <span className="text-xs text-text-muted">{formatDate(row.lastActive)}</span>,
    },
    {
      key: "id",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleResetPassword(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-yellow-400/50 hover:bg-yellow-400/8 hover:text-yellow-400"
            title="Reset Password"
            aria-label="Reset password"
          >
            <Key className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => router.push(`/setup/users/${row.id}/edit`)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-secondary/50 hover:bg-secondary/8 hover:text-secondary"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-text-muted/60 transition hover:border-red-500/50 hover:bg-red-500/8 hover:text-red-400"
            aria-label="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  const counts = {
    total:    users.length,
    admin:    users.filter((u) => u.roleName.toLowerCase() === "admin").length,
    operator: users.filter((u) => u.roleName.toLowerCase() === "operator").length,
    active:   users.filter((u) => u.status === "active").length,
  };

  const stats: StatCardProps[] = [
    { label: "Total User",  value: counts.total,    Icon: Users,       iconBg: "bg-primary/15",   iconColor: "text-primary",   valueColor: "text-text-primary" },
    { label: "Admin",       value: counts.admin,    Icon: ShieldCheck, iconBg: "bg-secondary/15", iconColor: "text-secondary", valueColor: "text-secondary" },
    { label: "Operator",    value: counts.operator, Icon: UserCog,     iconBg: "bg-accent/12",    iconColor: "text-accent",    valueColor: "text-accent" },
    { label: "Aktif",       value: counts.active,   Icon: UserCheck,   iconBg: "bg-green-500/12", iconColor: "text-green-400", valueColor: "text-green-400" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted/50">Setup</p>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Manajemen User</h1>
          <p className="mt-0.5 text-sm text-text-muted">Kelola akun pengguna dan hak akses sistem.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
          onClick={() => router.push("/setup/users/create")}
        >
          Tambah User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Fetch error */}
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
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>{filtered.length} dari {users.length} pengguna</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="w-48">
                <Input
                  placeholder="Cari nama / email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-3.5 w-3.5" strokeWidth={1.8} />}
                />
              </div>
              <div className="w-36">
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  options={toRoleOptions(roles)}
                  placeholder="Semua role"
                />
              </div>
              <div className="w-36">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[{ value: "active", label: "Aktif" }, { value: "inactive", label: "Nonaktif" }]}
                  placeholder="Semua status"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="Tidak ada user ditemukan."
            loading={fetching}
            onRefresh={loadUsers}
          />
        </CardContent>
      </Card>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        variant="delete"
        title="Hapus User"
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
          Yakin ingin menghapus user{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
          Semua data aktivitas user akan ikut terhapus.
        </p>
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return <ToastProvider><UsersListContent /></ToastProvider>;
}
