"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Search,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
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
import { EMPTY_FORM, normalizeVenue, type FormData, type FormErrors, type VenueItem } from "./_data";

// ─── Types ────────────────────────────────────────────────────────────────────

type SportTypeOption = {
  value: string;
  label: string;
};

type View = "list" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

// Will be fetched from API

// ─── Icons ────────────────────────────────────────────────────────────────────
// Using Lucide React icons imported above

// ─── Image uploader ───────────────────────────────────────────────────────────

function ImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border">
        {/* Preview */}
        <div className="relative aspect-video w-full overflow-hidden bg-ink-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview venue"
            className="h-full w-full object-cover"
          />
          {/* Overlay actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Ganti Foto
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 backdrop-blur-sm transition hover:bg-red-500/30"
            >
              <X className="h-3.5 w-3.5" /> Hapus
            </button>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-border bg-surface/60 px-3 py-2">
          <p className="text-xs text-text-muted">Foto venue berhasil dipilih</p>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <X /> Hapus foto
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-all ${
        dragging
          ? "border-secondary bg-secondary/5 text-secondary"
          : "border-border bg-surface/30 text-text-muted hover:border-secondary/50 hover:bg-surface-2/30 hover:text-text-primary"
      }`}
    >
      <Upload className="h-8 w-8" />
      <div className="text-center">
        <p className="text-sm font-medium">Klik atau seret foto ke sini</p>
        <p className="mt-0.5 text-xs text-text-muted">PNG, JPG, WEBP — maks. 5 MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ─── Form page ────────────────────────────────────────────────────────────────

function VenueFormPage({
  editTarget,
  form,
  setForm,
  errors,
  onSave,
  onBack,
  sportTypeOptions,
  submitting,
}: {
  editTarget: VenueItem | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  onSave: () => void;
  onBack: () => void;
  sportTypeOptions: SportTypeOption[];
  submitting: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-text-muted transition hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Venue
        </button>
        <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted">Master Data / Venue</p>
            <h1 className="text-xl font-bold text-text-primary">
              {editTarget ? `Edit Venue — ${editTarget.name}` : "Tambah Venue Baru"}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">
              {editTarget ? "Perbarui informasi dan foto venue." : "Isi detail venue baru."}
            </p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={submitting}>Batal</Button>
            <Button variant="primary" size="sm" onClick={onSave} disabled={submitting}>
              {editTarget ? "Simpan Perubahan" : "Tambah Venue"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left — image + status */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Foto Venue</CardTitle>
              <CardDescription>Foto akan ditampilkan di halaman booking.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Venue</CardTitle>
              <CardDescription>Venue nonaktif tidak muncul di halaman booking.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${form.active ? "text-green-400" : "text-text-muted"}`}>
                    {form.active ? "Aktif" : "Nonaktif"}
                  </p>
                  <p className="text-xs text-text-muted">
                    {form.active ? "Venue dapat dibooking." : "Venue disembunyikan dari booking."}
                  </p>
                </div>
                <Toggle
                  checked={form.active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                  label="Status venue"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — detail fields */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Venue</CardTitle>
              <CardDescription>Nama, jenis olahraga, kapasitas, dan lokasi.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Nama Venue"
                placeholder="cth. Padel Arena A"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Jenis Olahraga"
                  value={form.sportTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, sportTypeId: e.target.value }))}
                  options={sportTypeOptions}
                  placeholder="Pilih jenis..."
                  error={errors.sportTypeId}
                />
                <Input
                  label="Kapasitas (orang)"
                  type="number"
                  min={1}
                  placeholder="cth. 4"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                  error={errors.capacity}
                />
              </div>
              <Input
                label="Lokasi / Area"
                placeholder="cth. Lantai 2, Gedung Sport Center"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                error={errors.location}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deskripsi</CardTitle>
              <CardDescription>Informasi tambahan yang ditampilkan ke pelanggan.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                rows={5}
                placeholder="Deskripsikan fasilitas, kondisi, atau catatan penting venue ini..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/80 px-5 py-3.5">
        <p className="text-sm text-text-muted">
          {editTarget ? `Mengedit: ${editTarget.name}` : "Venue baru akan ditambahkan ke daftar."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={submitting}>Batal</Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={submitting}>
            {editTarget ? "Simpan Perubahan" : "Tambah Venue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────

function VenuesContent() {
  const { push } = useToast();
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [sportTypeOptions, setSportTypeOptions] = useState<SportTypeOption[]>([]);
  const [search, setSearch] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<View>("list");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editTarget, setEditTarget] = useState<VenueItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VenueItem | null>(null);

  // Load sport types for dropdown
  useEffect(() => {
    const loadSportTypes = async () => {
      try {
        const res = await fetch("/api/sport-types");
        if (!res.ok) throw new Error("Gagal memuat jenis olahraga");
        const data = await res.json();
        setSportTypeOptions(
          data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (err) {
        console.error("Error loading sport types:", err);
        push({
          title: "Gagal memuat jenis olahraga",
          description: "Coba refresh halaman.",
          variant: "error",
        });
      }
    };
    loadSportTypes();
  }, [push]);

  // Load venues from API
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/venues");
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setVenues(data.map(normalizeVenue));
    } catch (err) {
      console.error("Error loading venues:", err);
      push({
        title: "Gagal memuat data venue",
        description: "Coba refresh halaman.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const filtered = useMemo(
    () =>
      venues.filter((v) => {
        const q = search.toLowerCase();
        const matchSearch =
          v.name.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q);
        const matchSport = filterSport ? v.sportTypeId === filterSport : true;
        const matchStatus = filterStatus ? v.status === filterStatus : true;
        return matchSearch && matchSport && matchStatus;
      }),
    [venues, search, filterSport, filterStatus]
  );

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setView("form");
  }

  function openEdit(v: VenueItem) {
    setEditTarget(v);
    setForm({
      name: v.name,
      sportTypeId: v.sportTypeId,
      capacity: String(v.capacity),
      location: v.location,
      description: v.description,
      imageUrl: v.imageUrl,
      active: v.status === "ACTIVE",
    });
    setErrors({});
    setView("form");
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama venue wajib diisi";
    if (!form.sportTypeId) e.sportTypeId = "Jenis olahraga wajib dipilih";
    if (
      !form.capacity ||
      isNaN(Number(form.capacity)) ||
      Number(form.capacity) < 1
    )
      e.capacity = "Kapasitas harus berupa angka positif";
    if (!form.location.trim()) e.location = "Lokasi wajib diisi";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        sportTypeId: form.sportTypeId,
        capacity: Number(form.capacity),
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl,
        status: form.active ? "ACTIVE" : "INACTIVE",
      };

      const res = await fetch(
        editTarget ? `/api/venues/${editTarget.id}` : "/api/venues",
        {
          method: editTarget ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        push({
          title: "Gagal menyimpan",
          description: data.error ?? "Terjadi kesalahan.",
          variant: "error",
        });
        return;
      }

      push({
        title: editTarget ? "Berhasil diperbarui" : "Berhasil ditambah",
        description: `${form.name} ${
          editTarget ? "telah diupdate" : "telah ditambahkan"
        }.`,
        variant: "success",
      });
      setView("list");
      setEditTarget(null);
      setForm(EMPTY_FORM);
      await handleRefresh();
    } catch (err) {
      console.error("Error saving venue:", err);
      push({
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan, coba lagi.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/venues/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        push({
          title: "Gagal menghapus",
          description: data.error ?? "Terjadi kesalahan.",
          variant: "error",
        });
        return;
      }

      push({
        title: "Dihapus",
        description: `${deleteTarget.name} telah dihapus.`,
        variant: "success",
      });
      setDeleteTarget(null);
      await handleRefresh();
    } catch (err) {
      console.error("Error deleting venue:", err);
      push({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan, coba lagi.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Form view
  if (view === "form") {
    return (
      <VenueFormPage
        editTarget={editTarget}
        form={form}
        setForm={setForm}
        errors={errors}
        onSave={handleSave}
        onBack={() => setView("list")}
        sportTypeOptions={sportTypeOptions}
        submitting={submitting}
      />
    );
  }

  // List view
  const columns: Column<VenueItem>[] = [
    {
      key: "name",
      header: "Nama Venue",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.imageUrl}
                alt={row.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted/30">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-text-primary">{row.name}</p>
            <p className="text-xs text-text-muted">{row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sportTypeName",
      header: "Jenis Olahraga",
      render: (row) => <Badge variant="info">{row.sportTypeName}</Badge>,
    },
    {
      key: "capacity",
      header: "Kapasitas",
      align: "center",
      render: (row) => (
        <span className="text-sm text-text-muted">{row.capacity} orang</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) =>
        row.status === "ACTIVE" ? (
          <Badge variant="success" dot>
            Aktif
          </Badge>
        ) : (
          <Badge variant="muted" dot>
            Nonaktif
          </Badge>
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
          <p className="text-xs uppercase tracking-widest text-text-muted">
            Master Data
          </p>
          <h1 className="text-xl font-bold text-text-primary">Venues</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Kelola data lapangan olahraga.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
          onClick={openAdd}
        >
          Tambah Venue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Venue",
            value: venues.length,
            color: "text-text-primary",
          },
          {
            label: "Aktif",
            value: venues.filter((v) => v.status === "ACTIVE").length,
            color: "text-accent",
          },
          {
            label: "Nonaktif",
            value: venues.filter((v) => v.status === "INACTIVE").length,
            color: "text-red-400",
          },
          {
            label: "Jenis Olahraga",
            value: new Set(venues.map((v) => v.sportTypeId)).size,
            color: "text-secondary",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface/60 px-4 py-3"
          >
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
              <CardTitle>Daftar Venue</CardTitle>
              <CardDescription>
                {filtered.length} dari {venues.length} venue
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Input
                  placeholder="Cari nama / lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={
                    <Search
                      className="h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />
                  }
                />
              </div>
              <div className="w-40">
                <Select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  options={sportTypeOptions}
                  placeholder="Semua olahraga"
                />
              </div>
              <div className="w-36">
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { value: "ACTIVE", label: "Aktif" },
                    { value: "INACTIVE", label: "Nonaktif" },
                  ]}
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
            emptyMessage="Tidak ada venue ditemukan."
            loading={loading}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        variant="delete"
        title="Hapus Venue"
        onClose={() => setDeleteTarget(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={submitting}
            >
              Hapus
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-muted">
          Yakin ingin menghapus venue{" "}
          <span className="font-semibold text-text-primary">
            {deleteTarget?.name}
          </span>
          ?
        </p>
        <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          Semua pricing rule yang terhubung ke venue ini juga akan ikut
          terhapus.
        </p>
      </Modal>
    </div>
  );
}

export default function VenuesAdminPage() {
  return (
    <ToastProvider>
      <VenuesContent />
    </ToastProvider>
  );
}
