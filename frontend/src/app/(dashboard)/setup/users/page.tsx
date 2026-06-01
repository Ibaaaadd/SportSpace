"use client";

import { useMemo, useState } from "react";
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
import Toggle from "../../../../components/ui/Toggle";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserRole = "admin" | "operator" | "kasir" | "member";
type UserStatus = "active" | "inactive";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "admin",    label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "kasir",    label: "Kasir" },
  { value: "member",   label: "Member" },
];

const ROLE_BADGE: Record<UserRole, { variant: "info" | "success" | "warning" | "muted"; label: string }> = {
  admin:    { variant: "info",    label: "Admin" },
  operator: { variant: "success", label: "Operator" },
  kasir:    { variant: "warning", label: "Kasir" },
  member:   { variant: "muted",   label: "Member" },
};

const INITIAL_USERS: User[] = [
  { id: "u-1", name: "Budi Santoso",   email: "budi@sportspace.id",   phone: "081234567890", role: "admin",    status: "active",   lastActive: "2026-05-25" },
  { id: "u-2", name: "Sari Dewi",      email: "sari@sportspace.id",   phone: "082345678901", role: "operator", status: "active",   lastActive: "2026-05-25" },
  { id: "u-3", name: "Andi Pratama",   email: "andi@sportspace.id",   phone: "083456789012", role: "operator", status: "active",   lastActive: "2026-05-24" },
  { id: "u-4", name: "Rina Halim",     email: "rina@sportspace.id",   phone: "084567890123", role: "kasir",    status: "active",   lastActive: "2026-05-24" },
  { id: "u-5", name: "Doni Kurniawan", email: "doni@sportspace.id",   phone: "085678901234", role: "kasir",    status: "inactive", lastActive: "2026-04-10" },
  { id: "u-6", name: "Maya Putri",     email: "maya@sportspace.id",   phone: "086789012345", role: "member",   status: "active",   lastActive: "2026-05-23" },
  { id: "u-7", name: "Fajar Nugroho",  email: "fajar@sportspace.id",  phone: "087890123456", role: "member",   status: "active",   lastActive: "2026-05-22" },
  { id: "u-8", name: "Lina Agustina",  email: "lina@sportspace.id",   phone: "088901234567", role: "member",   status: "inactive", lastActive: "2026-03-15" },
];

const EMPTY_FORM: FormData = { name: "", email: "", phone: "", role: "operator", active: true };

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Main component ───────────────────────────────────────────────────────────

function UsersContent() {
  const { push } = useToast();
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  const filtered = useMemo(() =>
    users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole   = filterRole   ? u.role   === filterRole   : true;
      const matchStatus = filterStatus ? u.status === filterStatus : true;
      return matchSearch && matchRole && matchStatus;
    }),
    [users, search, filterRole, filterStatus]
  );

  function openAdd() {
    setEditTarget(null); setForm(EMPTY_FORM); setErrors({}); setFormOpen(true);
  }

  function openEdit(u: User) {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, active: u.status === "active" });
    setErrors({}); setFormOpen(true);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())            e.name  = "Nama wajib diisi";
    if (!form.email.trim())           e.email = "Email wajib diisi";
    else if (!validateEmail(form.email)) e.email = "Format email tidak valid";
    if (!form.role)                   e.role  = "Role wajib dipilih";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editTarget) {
      setUsers((prev) => prev.map((u) =>
        u.id === editTarget.id
          ? { ...u, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role as UserRole, status: form.active ? "active" : "inactive" }
          : u
      ));
      push({ title: "User diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
    } else {
      setUsers((prev) => [{
        id: `u-${Date.now()}`,
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        role: form.role as UserRole, status: form.active ? "active" : "inactive",
        lastActive: new Date().toISOString().split("T")[0],
      }, ...prev]);
      push({ title: "User ditambahkan", description: `${form.name} berhasil ditambahkan.`, variant: "success" });
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    push({ title: "User dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  function handleResetPassword(u: User) {
    push({ title: "Reset password dikirim", description: `Link reset password dikirim ke ${u.email}.`, variant: "info" });
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Pengguna",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" online={row.status === "active"} />
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
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
      render: (row) => {
        const cfg = ROLE_BADGE[row.role];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
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
          <button type="button" onClick={() => handleResetPassword(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-yellow-400/60 hover:text-yellow-400"
            title="Reset Password" aria-label="Reset password">
            <IconKey />
          </button>
          <button type="button" onClick={() => openEdit(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary"
            aria-label="Edit">
            <IconEdit />
          </button>
          <button type="button" onClick={() => setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-red-500/60 hover:text-red-400"
            aria-label="Hapus">
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  const counts = {
    total:    users.length,
    admin:    users.filter((u) => u.role === "admin").length,
    operator: users.filter((u) => u.role === "operator").length,
    active:   users.filter((u) => u.status === "active").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Setup</p>
          <h1 className="text-xl font-bold text-text-primary">Manajemen User</h1>
          <p className="mt-0.5 text-sm text-text-muted">Kelola akun pengguna dan hak akses sistem.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah User</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total User",  value: counts.total,    color: "text-text-primary" },
          { label: "Admin",       value: counts.admin,    color: "text-secondary" },
          { label: "Operator",    value: counts.operator, color: "text-accent" },
          { label: "Aktif",       value: counts.active,   color: "text-green-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`mt-0.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

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
                <Input placeholder="Cari nama / email..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<IconSearch />} />
              </div>
              <div className="w-36">
                <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} options={ROLE_OPTIONS} placeholder="Semua role" />
              </div>
              <div className="w-36">
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[{ value: "active", label: "Aktif" }, { value: "inactive", label: "Nonaktif" }]} placeholder="Semua status" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} emptyMessage="Tidak ada user ditemukan." loading={loading} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={formOpen} variant={editTarget ? "edit" : "create"}
        title={editTarget ? "Edit User" : "Tambah User"}
        description={editTarget ? `Perbarui data ${editTarget.name}.` : "Isi detail pengguna baru."}
        onClose={() => setFormOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>{editTarget ? "Simpan" : "Tambah"}</Button>
          </div>
        }>
        <div className="flex flex-col gap-4">
          <Input label="Nama Lengkap" placeholder="cth. Budi Santoso" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="budi@email.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
            <Input label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <Select label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} options={ROLE_OPTIONS} error={errors.role} />
          <div className="flex items-center justify-between rounded-xl border border-border bg-ink-2/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Status Akun</p>
              <p className="text-xs text-text-muted">{form.active ? "Akun aktif dan dapat login" : "Akun dinonaktifkan"}</p>
            </div>
            <Toggle checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} label="Status akun" />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteTarget} variant="delete" title="Hapus User" onClose={() => setDeleteTarget(null)} size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Hapus</Button>
          </div>
        }>
        <p className="text-sm text-text-muted">
          Yakin ingin menghapus user <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
          Semua data aktivitas user akan ikut terhapus.
        </p>
      </Modal>
    </div>
  );
}

export default function UsersPage() {
  return <ToastProvider><UsersContent /></ToastProvider>;
}
