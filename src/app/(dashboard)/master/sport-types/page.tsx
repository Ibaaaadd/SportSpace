"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Search, Trash2 } from "lucide-react";
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
import { EMPTY_FORM, normalizeSportType, type FormData, type FormErrors, type SportTypeItem } from "./_data";

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

// ─── Icons ────────────────────────────────────────────────────────────────────

// ─── Main component ───────────────────────────────────────────────────────────

function SportTypesContent() {
  const { push } = useToast();
  const [items, setItems] = useState<SportTypeItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editTarget, setEditTarget] = useState<SportTypeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SportTypeItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sport-types");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setItems(data.map(normalizeSportType));
    } catch {
      push({ title: "Gagal memuat data", description: "Coba refresh halaman.", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filtered = useMemo(() => items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(item: SportTypeItem) {
    setEditTarget(item);
    setForm({ name: item.name, description: item.description, color: item.color });
    setErrors({});
    setFormOpen(true);
  }

  function validate() {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const res = await fetch(editTarget ? `/api/sport-types/${editTarget.id}` : "/api/sport-types", {
        method: editTarget ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          color: form.color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        push({ title: "Gagal menyimpan", description: data.error ?? "Terjadi kesalahan.", variant: "error" });
        return;
      }

      push({
        title: editTarget ? "Berhasil diperbarui" : "Berhasil ditambah",
        description: `${form.name} ${editTarget ? "telah diupdate" : "telah ditambahkan"}.`,
        variant: "success",
      });
      setFormOpen(false);
      setEditTarget(null);
      setForm(EMPTY_FORM);
      await handleRefresh();
    } catch {
      push({ title: "Gagal menyimpan", description: "Terjadi kesalahan, coba lagi.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sport-types/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        push({ title: "Gagal menghapus", description: data.error ?? "Terjadi kesalahan.", variant: "error" });
        return;
      }

      push({ title: "Dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
      setDeleteTarget(null);
      await handleRefresh();
    } catch {
      push({ title: "Gagal menghapus", description: "Terjadi kesalahan, coba lagi.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<SportTypeItem>[] = [
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
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-red-500/60 hover:text-red-400"
            aria-label="Hapus"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
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
        <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />} onClick={openAdd}>
          Tambah Jenis
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
                leftIcon={<Search className="h-3.5 w-3.5" strokeWidth={1.8} />}
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
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} disabled={submitting}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={submitting}>
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
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={submitting}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={submitting}>Hapus</Button>
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
