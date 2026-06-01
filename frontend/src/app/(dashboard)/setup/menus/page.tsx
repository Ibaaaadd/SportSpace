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
import Select from "../../../../components/ui/Select";
import { ToastProvider, useToast } from "../../../../components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Menu = {
  id: string;
  label: string;
  icon: string;
  href: string;
  parentId: string | null;
  order: number;
  roles: string[];
  isActive: boolean;
};

type FormData = {
  label: string;
  icon: string;
  href: string;
  parentId: string;
  order: string;
  roles: string[];
  isActive: boolean;
};

type View = "list" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES_LIST = ["admin", "operator", "kasir", "member"];
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin", operator: "Operator", kasir: "Kasir", member: "Member",
};

const INITIAL_DATA: Menu[] = [
  { id: "m-1",  label: "Dashboard",      icon: "LayoutDashboard", href: "/dashboard",         parentId: null,   order: 1, roles: ["admin","operator","kasir","member"], isActive: true  },
  { id: "m-2",  label: "Booking",        icon: "CalendarCheck",   href: "/bookings",           parentId: null,   order: 2, roles: ["admin","operator","kasir"],          isActive: true  },
  { id: "m-3",  label: "Pembayaran",     icon: "CreditCard",      href: "/payments",           parentId: null,   order: 3, roles: ["admin","operator","kasir"],          isActive: true  },
  { id: "m-4",  label: "Master Data",    icon: "Database",        href: "#",                   parentId: null,   order: 4, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-5",  label: "Jenis Olahraga", icon: "Tag",             href: "/master/sport-types", parentId: "m-4",  order: 1, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-6",  label: "Venue",          icon: "MapPin",          href: "/master/venues",      parentId: "m-4",  order: 2, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-7",  label: "Harga",          icon: "DollarSign",      href: "/master/pricing",     parentId: "m-4",  order: 3, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-8",  label: "Laporan",        icon: "BarChart2",       href: "#",                   parentId: null,   order: 5, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-9",  label: "Okupansi",       icon: "Activity",        href: "/report/occupancy",   parentId: "m-8",  order: 1, roles: ["admin","operator"],                  isActive: true  },
  { id: "m-10", label: "Pendapatan",     icon: "TrendingUp",      href: "/report/revenue",     parentId: "m-8",  order: 2, roles: ["admin"],                             isActive: true  },
  { id: "m-11", label: "Setup",          icon: "Settings",        href: "#",                   parentId: null,   order: 6, roles: ["admin"],                             isActive: true  },
  { id: "m-12", label: "Pengguna",       icon: "Users",           href: "/setup/users",        parentId: "m-11", order: 1, roles: ["admin"],                             isActive: true  },
  { id: "m-13", label: "Role",           icon: "Shield",          href: "/setup/roles",        parentId: "m-11", order: 2, roles: ["admin"],                             isActive: true  },
  { id: "m-14", label: "Menu",           icon: "Menu",            href: "/setup/menus",        parentId: "m-11", order: 3, roles: ["admin"],                             isActive: false },
];

const EMPTY_FORM: FormData = {
  label: "", icon: "", href: "", parentId: "", order: "1", roles: [], isActive: true,
};

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

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6" />
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

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, size = "md" }: { checked: boolean; onChange: () => void; size?: "sm" | "md" }) {
  const track = size === "sm" ? "h-4 w-7" : "h-5 w-9";
  const thumb = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const translate = size === "sm" ? "translate-x-3" : "translate-x-4";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${track} ${
        checked ? "bg-secondary" : "bg-surface-2 border border-border"
      }`}
    >
      <span className={`pointer-events-none inline-block transform rounded-full bg-white shadow transition-transform ${thumb} ${checked ? translate : "translate-x-0"}`} />
    </button>
  );
}

// ─── Form page ────────────────────────────────────────────────────────────────

function MenuFormPage({
  editTarget,
  form,
  setForm,
  errors,
  parentMenus,
  onSave,
  onBack,
}: {
  editTarget: Menu | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Partial<Pick<FormData, "label" | "href">>;
  parentMenus: Menu[];
  onSave: () => void;
  onBack: () => void;
}) {
  function toggleRole(role: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

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
          Kembali ke Daftar Menu
        </button>
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Setup / Menu</p>
            <h1 className="text-xl font-bold text-text-primary">
              {editTarget ? `Edit Menu — ${editTarget.label}` : "Tambah Menu Baru"}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">
              {editTarget ? "Perbarui konfigurasi item navigasi." : "Tambah item navigasi baru ke sidebar."}
            </p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              {editTarget ? "Simpan Perubahan" : "Tambah Menu"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left — main fields */}
        <div className="flex flex-col gap-4">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Label, icon, dan path yang ditampilkan di navigasi.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Label Menu"
                placeholder="cth. Dashboard, Booking, Laporan..."
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                error={errors.label}
              />
              <Input
                label="Path / Href"
                placeholder="cth. /dashboard, /master/venues, #"
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                error={errors.href}
                hint='Gunakan "#" jika menu ini hanya sebagai grup (tanpa halaman tujuan).'
              />
              <Input
                label="Nama Icon"
                placeholder="cth. LayoutDashboard, CalendarCheck, Users..."
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                hint="Gunakan nama icon dari lucide-react."
              />
            </CardContent>
          </Card>

          {/* Navigation structure */}
          <Card>
            <CardHeader>
              <CardTitle>Struktur Navigasi</CardTitle>
              <CardDescription>Tentukan posisi menu dalam hierarki sidebar.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Parent Menu"
                  value={form.parentId}
                  onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
                  options={[
                    { value: "", label: "— Root (tanpa parent) —" },
                    ...parentMenus.map((m) => ({ value: m.id, label: m.label })),
                  ]}
                />
                <Input
                  label="Urutan Tampil"
                  type="number"
                  placeholder="1"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                  hint="Urutan relatif di antara menu satu level."
                />
              </div>

              {/* Preview */}
              {form.label && (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-ink-2/30 px-4 py-3">
                  <span className="text-xs text-text-muted">Preview:</span>
                  {form.parentId && (
                    <>
                      <span className="text-xs text-text-muted">
                        {parentMenus.find((m) => m.id === form.parentId)?.label ?? "Parent"}
                      </span>
                      <IconChevronRight />
                    </>
                  )}
                  <span className="text-xs font-medium text-text-primary">{form.label || "—"}</span>
                  {form.href && form.href !== "#" && (
                    <span className="ml-auto font-mono text-xs text-text-muted/60">{form.href}</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — visibility & status */}
        <div className="flex flex-col gap-4">
          {/* Role visibility */}
          <Card>
            <CardHeader>
              <CardTitle>Visibilitas Role</CardTitle>
              <CardDescription>Menu hanya tampil untuk role yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {ROLES_LIST.map((r) => {
                  const checked = form.roles.includes(r);
                  return (
                    <label
                      key={r}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 transition select-none ${
                        checked
                          ? "border-secondary/40 bg-secondary/8 text-secondary"
                          : "border-border text-text-muted hover:border-border/60 hover:bg-surface-2/40"
                      }`}
                    >
                      <span className="text-sm font-medium">{ROLE_LABEL[r]}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRole(r)}
                        className="h-4 w-4 rounded border-border accent-secondary"
                      />
                    </label>
                  );
                })}
                {form.roles.length === 0 && (
                  <p className="mt-1 text-xs text-yellow-400">Pilih minimal satu role agar menu tampil.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Menu hanya muncul di navigasi jika aktif.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {form.isActive ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {form.isActive ? "Menu tampil di sidebar." : "Menu disembunyikan dari sidebar."}
                  </p>
                </div>
                <Toggle checked={form.isActive} onChange={() => setForm((f) => ({ ...f, isActive: !f.isActive }))} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/80 px-5 py-3.5">
        <p className="text-sm text-text-muted">
          {form.roles.length > 0
            ? `Visible untuk: ${form.roles.map((r) => ROLE_LABEL[r]).join(", ")}`
            : "Belum ada role yang dipilih"}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
          <Button variant="primary" size="sm" onClick={onSave}>
            {editTarget ? "Simpan Perubahan" : "Tambah Menu"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function MenusContent() {
  const { push } = useToast();
  const [view, setView]   = useState<View>("list");
  const [items, setItems] = useState<Menu[]>(INITIAL_DATA);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [form, setForm]           = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors]       = useState<Partial<Pick<FormData, "label" | "href">>>({});
  const [editTarget, setEditTarget]   = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);

  const parentMenus = items.filter((i) => i.parentId === null);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(search.toLowerCase()) ||
      i.href.toLowerCase().includes(search.toLowerCase()) ||
      i.icon.toLowerCase().includes(search.toLowerCase())
  );

  function getParentLabel(parentId: string | null) {
    if (!parentId) return null;
    return items.find((i) => i.id === parentId)?.label ?? parentId;
  }

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setView("form");
  }

  function openEdit(item: Menu) {
    setEditTarget(item);
    setForm({
      label: item.label,
      icon: item.icon,
      href: item.href,
      parentId: item.parentId ?? "",
      order: String(item.order),
      roles: [...item.roles],
      isActive: item.isActive,
    });
    setErrors({});
    setView("form");
  }

  function validate() {
    const e: Partial<Pick<FormData, "label" | "href">> = {};
    if (!form.label.trim()) e.label = "Label menu wajib diisi";
    if (!form.href.trim())  e.href  = "Path/href wajib diisi";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const parsed: Menu = {
      id: editTarget?.id ?? `m-${Date.now()}`,
      label: form.label.trim(),
      icon: form.icon.trim(),
      href: form.href.trim(),
      parentId: form.parentId || null,
      order: parseInt(form.order, 10) || 1,
      roles: form.roles,
      isActive: form.isActive,
    };

    if (editTarget) {
      setItems((prev) => prev.map((i) => (i.id === editTarget.id ? parsed : i)));
      push({ title: "Menu diperbarui", description: `${form.label} berhasil diupdate.`, variant: "success" });
    } else {
      setItems((prev) => [...prev, parsed]);
      push({ title: "Menu ditambahkan", description: `${form.label} berhasil ditambahkan.`, variant: "success" });
    }
    setView("list");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id && i.parentId !== deleteTarget.id));
    push({ title: "Menu dihapus", description: `${deleteTarget.label} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  function toggleActive(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i)));
  }

  // ── Form view ──
  if (view === "form") {
    return (
      <MenuFormPage
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        errors={errors}
        parentMenus={parentMenus}
        onSave={handleSave}
        onBack={() => setView("list")}
      />
    );
  }

  // ── List view ──
  const columns: Column<Menu>[] = [
    {
      key: "label",
      header: "Menu",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.parentId && <span className="flex items-center text-text-muted"><IconChevronRight /></span>}
          <div>
            <p className={`font-medium ${row.parentId ? "text-sm text-text-muted" : "text-text-primary"}`}>
              {row.label}
            </p>
            <p className="text-xs text-text-muted/60">{row.href}</p>
          </div>
        </div>
      ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (row) => (
        <span className="rounded-lg border border-border bg-ink-2/60 px-2 py-0.5 font-mono text-xs text-text-muted">
          {row.icon || "—"}
        </span>
      ),
    },
    {
      key: "parentId",
      header: "Parent",
      render: (row) => {
        const label = getParentLabel(row.parentId);
        return label
          ? <Badge variant="muted">{label}</Badge>
          : <span className="text-xs text-text-muted/40">Root</span>;
      },
    },
    {
      key: "roles",
      header: "Role",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((r) => (
            <Badge key={r} variant="info">{ROLE_LABEL[r] ?? r}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: "order",
      header: "Urutan",
      align: "center",
      render: (row) => <span className="text-sm text-text-muted">{row.order}</span>,
    },
    {
      key: "isActive",
      header: "Aktif",
      align: "center",
      render: (row) => (
        <Toggle checked={row.isActive} onChange={() => toggleActive(row.id)} size="sm" />
      ),
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
            onClick={() => setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-red-500/60 hover:text-red-400"
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
          <h1 className="text-xl font-bold text-text-primary">Manajemen Menu</h1>
          <p className="mt-0.5 text-sm text-text-muted">Konfigurasi navigasi dan visibilitas menu per role.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah Menu</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Menu", value: items.length },
          { label: "Menu Utama", value: items.filter((i) => !i.parentId).length },
          { label: "Sub Menu",   value: items.filter((i) => !!i.parentId).length },
          { label: "Menu Aktif", value: items.filter((i) => i.isActive).length },
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
              <CardTitle>Daftar Menu</CardTitle>
              <CardDescription>{filtered.length} dari {items.length} menu</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input
                placeholder="Cari label, href, atau icon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<IconSearch />}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="Tidak ada menu ditemukan."
            loading={loading}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        variant="delete"
        title="Hapus Menu"
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
          Yakin ingin menghapus menu{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.label}</span>?
        </p>
        {deleteTarget && !deleteTarget.parentId && items.some((i) => i.parentId === deleteTarget.id) && (
          <p className="mt-3 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-3 py-2.5 text-xs text-yellow-300">
            Perhatian: menu ini memiliki sub-menu yang juga akan ikut terhapus.
          </p>
        )}
      </Modal>
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
