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

// ─── Types ───────────────────────────────────────────────────────────────────

type SportType = {
  id: string;
  name: string;
  description: string;
  color: string;
  venueCount: number;
};

type FormData = { name: string; description: string; color: string };

// ─── Color config ─────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { value: "blue",   dot: "bg-blue-500",   ring: "ring-blue-500" },
  { value: "green",  dot: "bg-green-500",  ring: "ring-green-500" },
  { value: "yellow", dot: "bg-yellow-400", ring: "ring-yellow-400" },
  { value: "red",    dot: "bg-red-500",    ring: "ring-red-500" },
  { value: "purple", dot: "bg-purple-500", ring: "ring-purple-500" },
  { value: "orange", dot: "bg-orange-400", ring: "ring-orange-400" },
  { value: "cyan",   dot: "bg-cyan-400",   ring: "ring-cyan-400" },
  { value: "pink",   dot: "bg-pink-500",   ring: "ring-pink-500" },
];

const COLOR_DOT: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", yellow: "bg-yellow-400",
  red: "bg-red-500",   purple: "bg-purple-500", orange: "bg-orange-400",
  cyan: "bg-cyan-400", pink: "bg-pink-500",
};

const COLOR_BADGE: Record<string, string> = {
  blue:   "border-blue-500/40 bg-blue-500/10 text-blue-400",
  green:  "border-green-500/40 bg-green-500/10 text-green-400",
  yellow: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400",
  red:    "border-red-500/40 bg-red-500/10 text-red-400",
  purple: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  orange: "border-orange-400/40 bg-orange-400/10 text-orange-400",
  cyan:   "border-cyan-400/40 bg-cyan-400/10 text-cyan-400",
  pink:   "border-pink-500/40 bg-pink-500/10 text-pink-400",
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_DATA: SportType[] = [
  { id: "st-1", name: "Padel",        description: "Olahraga raket kombinasi tenis dan squash.",  color: "blue",   venueCount: 3 },
  { id: "st-2", name: "Futsal",       description: "Sepak bola mini dalam ruangan.",               color: "green",  venueCount: 5 },
  { id: "st-3", name: "Mini Soccer",  description: "Versi kecil sepak bola lapangan.",             color: "yellow", venueCount: 2 },
  { id: "st-4", name: "Badminton",    description: "Olahraga raket dengan shuttlecock.",           color: "red",    venueCount: 4 },
  { id: "st-5", name: "Tennis Indoor",description: "Tenis lapangan dalam ruangan.",                color: "purple", venueCount: 1 },
];

const EMPTY_FORM: FormData = { name: "", description: "", color: "blue" };

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

// ─── Main component ───────────────────────────────────────────────────────────

function SportTypesContent() {
  const { push } = useToast();
  const [items, setItems] = useState<SportType[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [editTarget, setEditTarget] = useState<SportType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SportType | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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
    setFormOpen(true);
  }

  function openEdit(item: SportType) {
    setEditTarget(item);
    setForm({ name: item.name, description: item.description, color: item.color });
    setErrors({});
    setFormOpen(true);
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    if (editTarget) {
      setItems((prev) =>
        prev.map((i) => (i.id === editTarget.id ? { ...i, ...form } : i))
      );
      push({ title: "Berhasil diperbarui", description: `${form.name} telah diupdate.`, variant: "success" });
    } else {
      setItems((prev) => [
        { id: `st-${Date.now()}`, name: form.name.trim(), description: form.description.trim(), color: form.color, venueCount: 0 },
        ...prev,
      ]);
      push({ title: "Berhasil ditambah", description: `${form.name} telah ditambahkan.`, variant: "success" });
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    push({ title: "Dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  const columns: Column<SportType>[] = [
    {
      key: "name",
      header: "Nama",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${COLOR_DOT[row.color] ?? "bg-text-muted"}`} />
          <span className="font-medium text-text-primary">{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (row) => <span className="text-text-muted">{row.description || "—"}</span>,
    },
    {
      key: "color",
      header: "Warna",
      align: "center",
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${COLOR_BADGE[row.color] ?? "border-border bg-ink-2 text-text-muted"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${COLOR_DOT[row.color] ?? ""}`} />
          {row.color}
        </span>
      ),
    },
    {
      key: "venueCount",
      header: "Venue",
      align: "center",
      render: (row) => <Badge variant="muted">{row.venueCount} venue</Badge>,
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
          <p className="text-xs uppercase tracking-widest text-text-muted">Master Data</p>
          <h1 className="text-xl font-bold text-text-primary">Jenis Olahraga</h1>
          <p className="mt-0.5 text-sm text-text-muted">Kelola kategori olahraga untuk semua venue.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Tambah Jenis
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Jenis Olahraga</CardTitle>
              <CardDescription>{filtered.length} dari {items.length} jenis olahraga</CardDescription>
            </div>
            <div className="w-full max-w-xs">
              <Input
                placeholder="Cari nama atau deskripsi..."
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
            emptyMessage="Tidak ada jenis olahraga ditemukan."
            loading={loading}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        variant={editTarget ? "edit" : "create"}
        title={editTarget ? "Edit Jenis Olahraga" : "Tambah Jenis Olahraga"}
        description={editTarget ? `Perbarui data ${editTarget.name}.` : "Isi detail jenis olahraga baru."}
        onClose={() => setFormOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editTarget ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nama Jenis Olahraga"
            placeholder="cth. Padel, Futsal, Badminton..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Deskripsi
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi singkat jenis olahraga..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Warna</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                  className={`h-7 w-7 rounded-full transition ${c.dot} ${
                    form.color === c.value
                      ? `ring-2 ring-offset-2 ring-offset-surface ${c.ring}`
                      : "opacity-50 hover:opacity-100"
                  }`}
                  aria-label={c.value}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        variant="delete"
        title="Hapus Jenis Olahraga"
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
          Yakin ingin menghapus{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
        </p>
        {deleteTarget && deleteTarget.venueCount > 0 && (
          <p className="mt-3 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-3 py-2.5 text-xs text-yellow-300">
            Perhatian: ada {deleteTarget.venueCount} venue yang menggunakan jenis ini. Data venue tidak akan ikut terhapus.
          </p>
        )}
      </Modal>
    </div>
  );
}

export default function SportTypesPage() {
  return (
    <ToastProvider>
      <SportTypesContent />
    </ToastProvider>
  );
}
