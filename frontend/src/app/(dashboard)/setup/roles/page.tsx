"use client";

import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import DataTable, { type Column } from "../../../../components/ui/DataTable";
import Input from "../../../../components/ui/Input";
import Modal from "../../../../components/ui/Modal";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
};

type FormData = {
  name: string;
  description: string;
  permissions: string[];
};

type View = "list" | "form";

// ─── Permission groups ────────────────────────────────────────────────────────

const PERM_GROUPS = [
  { module: "Dashboard",   key: "dashboard",   perms: ["view"] },
  { module: "Master Data", key: "master",      perms: ["view", "create", "edit", "delete"] },
  { module: "Transaksi",   key: "transaction", perms: ["view", "create", "edit", "delete"] },
  { module: "Laporan",     key: "report",      perms: ["view", "export"] },
  { module: "Setup",       key: "setup",       perms: ["view", "create", "edit", "delete"] },
];

const PERM_LABEL: Record<string, string> = {
  view: "Lihat", create: "Buat", edit: "Edit", delete: "Hapus", export: "Export",
};

function permKey(mod: string, perm: string) { return `${mod}.${perm}`; }

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_DATA: Role[] = [
  {
    id: "r-1", name: "Admin", description: "Akses penuh ke seluruh sistem.", isSystem: true,
    userCount: 2,
    permissions: PERM_GROUPS.flatMap((g) => g.perms.map((p) => permKey(g.key, p))),
  },
  {
    id: "r-2", name: "Operator", description: "Kelola venue, booking, dan pembayaran.", isSystem: false,
    userCount: 5,
    permissions: [
      "dashboard.view",
      "master.view", "transaction.view", "transaction.create", "transaction.edit",
      "report.view",
    ],
  },
  {
    id: "r-3", name: "Kasir", description: "Proses pembayaran dan cetak struk.", isSystem: false,
    userCount: 3,
    permissions: ["dashboard.view", "transaction.view", "transaction.create", "report.view"],
  },
  {
    id: "r-4", name: "Member", description: "Hanya bisa melihat jadwal dan booking mandiri.", isSystem: false,
    userCount: 24,
    permissions: ["dashboard.view", "transaction.view", "transaction.create"],
  },
];

const EMPTY_FORM: FormData = { name: "", description: "", permissions: [] };

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

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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

// ─── Permission grid ──────────────────────────────────────────────────────────

function PermissionGrid({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  }

  function toggleModule(mod: string, perms: string[]) {
    const keys = perms.map((p) => permKey(mod, p));
    const allChecked = keys.every((k) => value.includes(k));
    if (allChecked) {
      onChange(value.filter((k) => !keys.includes(k)));
    } else {
      const next = [...value];
      keys.forEach((k) => { if (!next.includes(k)) next.push(k); });
      onChange(next);
    }
  }

  function selectAll() {
    onChange(PERM_GROUPS.flatMap((g) => g.perms.map((p) => permKey(g.key, p))));
  }
  function clearAll() { onChange([]); }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">Izin Akses</p>
          <p className="text-xs text-text-muted">{value.length} izin dipilih dari {PERM_GROUPS.flatMap((g) => g.perms).length} tersedia</p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={selectAll} className="text-xs font-medium text-secondary hover:underline">Pilih Semua</button>
          <button type="button" onClick={clearAll}  className="text-xs font-medium text-text-muted hover:text-red-400">Hapus Semua</button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/50 rounded-xl border border-border overflow-hidden">
        {PERM_GROUPS.map((group) => {
          const keys = group.perms.map((p) => permKey(group.key, p));
          const allChecked = keys.every((k) => value.includes(k));
          const someChecked = keys.some((k) => value.includes(k));
          return (
            <div key={group.key} className="flex items-start gap-4 bg-surface/40 px-4 py-3.5 hover:bg-surface/60 transition-colors">
              {/* Module checkbox */}
              <label className="flex cursor-pointer items-center gap-2.5 select-none pt-0.5 min-w-30">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                  onChange={() => toggleModule(group.key, group.perms)}
                  className="h-4 w-4 rounded border-border accent-secondary"
                />
                <span className="text-sm font-semibold text-text-primary">{group.module}</span>
              </label>

              {/* Permission pills */}
              <div className="flex flex-wrap gap-2">
                {group.perms.map((perm) => {
                  const key = permKey(group.key, perm);
                  const checked = value.includes(key);
                  return (
                    <label
                      key={key}
                      className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1 text-xs font-medium transition select-none ${
                        checked
                          ? "border-secondary/50 bg-secondary/10 text-secondary"
                          : "border-border bg-transparent text-text-muted hover:border-border/80 hover:text-text-primary"
                      }`}
                    >
                      <input type="checkbox" checked={checked} onChange={() => toggle(key)} className="sr-only" />
                      {PERM_LABEL[perm] ?? perm}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Form page ────────────────────────────────────────────────────────────────

function RoleFormPage({
  editTarget,
  form,
  setForm,
  errors,
  onSave,
  onBack,
}: {
  editTarget: Role | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<Pick<FormData, "name">>;
  onSave: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb header */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-text-muted transition hover:text-text-primary"
        >
          <IconBack />
          Kembali ke Daftar Role
        </button>
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Setup / Role</p>
            <h1 className="text-xl font-bold text-text-primary">
              {editTarget ? `Edit Role — ${editTarget.name}` : "Tambah Role Baru"}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">
              {editTarget ? "Perbarui informasi dan izin akses role." : "Buat role baru dengan konfigurasi izin akses."}
            </p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              {editTarget ? "Simpan Perubahan" : "Buat Role"}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout: sidebar info + main permissions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left — basic info */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Role</CardTitle>
              <CardDescription>Nama dan deskripsi singkat peran ini.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nama Role"
                placeholder="cth. Supervisor, Resepsionis..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Deskripsi
                </label>
                <textarea
                  rows={4}
                  placeholder="Jelaskan tanggung jawab dan ruang lingkup role ini..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary card */}
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Ringkasan</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{form.permissions.length}</p>
            <p className="text-xs text-text-muted">izin aktif dari {PERM_GROUPS.flatMap((g) => g.perms).length} tersedia</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2/60">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-500"
                style={{ width: `${(form.permissions.length / PERM_GROUPS.flatMap((g) => g.perms).length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right — permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Izin Akses</CardTitle>
            <CardDescription>Pilih modul dan operasi yang diizinkan untuk role ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGrid
              value={form.permissions}
              onChange={(v) => setForm((f) => ({ ...f, permissions: v }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/80 px-5 py-3.5">
        <p className="text-sm text-text-muted">
          {form.permissions.length} izin dipilih
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {editTarget ? "Simpan Perubahan" : "Buat Role"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── List page ────────────────────────────────────────────────────────────────

function RolesContent() {
  const { push } = useToast();
  const [view, setView]   = useState<View>("list");
  const [items, setItems] = useState<Role[]>(INITIAL_DATA);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors]     = useState<Partial<Pick<FormData, "name">>>({});
  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [permOpen, setPermOpen] = useState<Role | null>(null);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setView("form");
  }

  function openEdit(item: Role) {
    setEditTarget(item);
    setForm({ name: item.name, description: item.description, permissions: [...item.permissions] });
    setErrors({});
    setView("form");
  }

  function validate() {
    const e: Partial<Pick<FormData, "name">> = {};
    if (!form.name.trim()) e.name = "Nama role wajib diisi";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editTarget) {
      setItems((prev) => prev.map((i) => (i.id === editTarget.id ? { ...i, ...form } : i)));
      push({ title: "Role diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
    } else {
      setItems((prev) => [
        { id: `r-${Date.now()}`, name: form.name.trim(), description: form.description.trim(), permissions: form.permissions, userCount: 0, isSystem: false },
        ...prev,
      ]);
      push({ title: "Role ditambahkan", description: `${form.name} berhasil dibuat.`, variant: "success" });
    }
    setView("list");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    push({ title: "Role dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  // ── Form view ──
  if (view === "form") {
    return (
      <RoleFormPage
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        errors={errors}
        onSave={handleSave}
        onBack={() => setView("list")}
      />
    );
  }

  // ── List view ──
  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Nama Role",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/10 text-secondary">
            <IconShield />
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-text-muted transition hover:border-secondary/50 hover:text-secondary"
        >
          <IconShield />
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
            onClick={() => openEdit(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary"
            aria-label="Edit"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            disabled={row.isSystem}
            onClick={() => !row.isSystem && setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-red-500/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Hapus"
          >
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Setup</p>
          <h1 className="text-xl font-bold text-text-primary">Manajemen Role</h1>
          <p className="mt-0.5 text-sm text-text-muted">Atur hak akses dan izin untuk setiap peran pengguna.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah Role</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Role",     value: items.length },
          { label: "Role System",    value: items.filter((i) => i.isSystem).length },
          { label: "Role Custom",    value: items.filter((i) => !i.isSystem).length },
          { label: "Total Pengguna", value: items.reduce((a, b) => a + b.userCount, 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className="mt-0.5 text-xl font-bold text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Role</CardTitle>
              <CardDescription>{filtered.length} dari {items.length} role</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input placeholder="Cari nama atau deskripsi..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<IconSearch />} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} emptyMessage="Tidak ada role ditemukan." loading={loading} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      {/* View permissions modal (read-only, small — modal still appropriate) */}
      <Modal
        open={!!permOpen}
        variant="default"
        title={`Izin — ${permOpen?.name ?? ""}`}
        description={`${permOpen?.permissions.length ?? 0} izin aktif`}
        onClose={() => setPermOpen(null)}
        size="md"
        footer={<div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => setPermOpen(null)}>Tutup</Button></div>}
      >
        {permOpen && (
          <div className="flex flex-col gap-3">
            {PERM_GROUPS.map((group) => {
              const active = group.perms.filter((p) => permOpen.permissions.includes(permKey(group.key, p)));
              if (active.length === 0) return null;
              return (
                <div key={group.key}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-text-muted">{group.module}</p>
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
        onClose={() => setDeleteTarget(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Hapus</Button>
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
  return (
    <ToastProvider>
      <RolesContent />
    </ToastProvider>
  );
}
