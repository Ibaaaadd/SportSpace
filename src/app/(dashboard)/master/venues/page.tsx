"use client";

import { useRef, useState, useMemo } from "react";
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

type Venue = {
  id: string;
  name: string;
  sportTypeId: string;
  sportTypeName: string;
  capacity: number;
  location: string;
  description: string;
  imageUrl: string | null;
  status: "active" | "inactive";
};

type FormData = {
  name: string;
  sportTypeId: string;
  capacity: string;
  location: string;
  description: string;
  imageUrl: string | null;
  active: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
type View = "list" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPORT_TYPE_OPTIONS = [
  { value: "st-1", label: "Padel" },
  { value: "st-2", label: "Futsal" },
  { value: "st-3", label: "Mini Soccer" },
  { value: "st-4", label: "Badminton" },
  { value: "st-5", label: "Tennis Indoor" },
];

const SPORT_TYPE_NAME: Record<string, string> = Object.fromEntries(
  SPORT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

const INITIAL_VENUES: Venue[] = [
  { id: "v-1", name: "Padel Arena A",    sportTypeId: "st-1", sportTypeName: "Padel",         capacity: 4,  location: "Lantai 2, Gedung Sport Center", description: "Lapangan padel premium dengan kaca tempered.", imageUrl: null, status: "active" },
  { id: "v-2", name: "Padel Arena B",    sportTypeId: "st-1", sportTypeName: "Padel",         capacity: 4,  location: "Lantai 2, Gedung Sport Center", description: "", imageUrl: null, status: "active" },
  { id: "v-3", name: "Futsal Prime",     sportTypeId: "st-2", sportTypeName: "Futsal",        capacity: 14, location: "Lantai 1, Gedung Sport Center", description: "Lapangan futsal dengan rumput sintetis premium.", imageUrl: null, status: "active" },
  { id: "v-4", name: "Mini Soccer 1",    sportTypeId: "st-3", sportTypeName: "Mini Soccer",   capacity: 16, location: "Outdoor, Area A",               description: "", imageUrl: null, status: "active" },
  { id: "v-5", name: "Badminton Hall",   sportTypeId: "st-4", sportTypeName: "Badminton",     capacity: 4,  location: "Lantai 3, Gedung Sport Center", description: "", imageUrl: null, status: "active" },
  { id: "v-6", name: "Tennis Indoor 1",  sportTypeId: "st-5", sportTypeName: "Tennis Indoor", capacity: 4,  location: "Lantai 3, Gedung Sport Center", description: "Sedang dalam renovasi.", imageUrl: null, status: "inactive" },
];

const EMPTY_FORM: FormData = {
  name: "", sportTypeId: "", capacity: "", location: "", description: "", imageUrl: null, active: true,
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

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 22V12h6v10M3 9h18" />
    </svg>
  );
}

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
              <IconX /> Hapus
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
            <IconX /> Hapus foto
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
      <IconUpload />
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
}: {
  editTarget: Venue | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  onSave: () => void;
  onBack: () => void;
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
          <IconBack />
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
            <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
            <Button variant="primary" size="sm" onClick={onSave}>
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
                  options={SPORT_TYPE_OPTIONS}
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
          <Button variant="ghost" size="sm" onClick={onBack}>Batal</Button>
          <Button variant="primary" size="sm" onClick={onSave}>
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
  const [view, setView]         = useState<View>("list");
  const [venues, setVenues]     = useState<Venue[]>(INITIAL_VENUES);
  const [search, setSearch]     = useState("");
  const [filterSport, setFilterSport]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [editTarget, setEditTarget]     = useState<Venue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }

  const filtered = useMemo(() =>
    venues.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch = v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
      const matchSport  = filterSport  ? v.sportTypeId === filterSport  : true;
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

  function openEdit(v: Venue) {
    setEditTarget(v);
    setForm({
      name: v.name,
      sportTypeId: v.sportTypeId,
      capacity: String(v.capacity),
      location: v.location,
      description: v.description,
      imageUrl: v.imageUrl,
      active: v.status === "active",
    });
    setErrors({});
    setView("form");
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())      e.name       = "Nama venue wajib diisi";
    if (!form.sportTypeId)      e.sportTypeId = "Jenis olahraga wajib dipilih";
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
                                e.capacity   = "Kapasitas harus berupa angka positif";
    if (!form.location.trim())  e.location   = "Lokasi wajib diisi";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const sportTypeName = SPORT_TYPE_NAME[form.sportTypeId] ?? "";

    if (editTarget) {
      setVenues((prev) =>
        prev.map((v) =>
          v.id === editTarget.id
            ? { ...v, name: form.name.trim(), sportTypeId: form.sportTypeId, sportTypeName, capacity: Number(form.capacity), location: form.location.trim(), description: form.description.trim(), imageUrl: form.imageUrl, status: form.active ? "active" : "inactive" }
            : v
        )
      );
      push({ title: "Venue diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
    } else {
      setVenues((prev) => [{
        id: `v-${Date.now()}`,
        name: form.name.trim(),
        sportTypeId: form.sportTypeId,
        sportTypeName,
        capacity: Number(form.capacity),
        location: form.location.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl,
        status: form.active ? "active" : "inactive",
      }, ...prev]);
      push({ title: "Venue ditambahkan", description: `${form.name} berhasil ditambahkan.`, variant: "success" });
    }
    setView("list");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setVenues((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    push({ title: "Venue dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  // ── Form view ──
  if (view === "form") {
    return (
      <VenueFormPage
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
  const columns: Column<Venue>[] = [
    {
      key: "name",
      header: "Nama Venue",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt={row.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-text-muted/30">
                <IconImage />
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
      render: (row) => <span className="text-sm text-text-muted">{row.capacity} orang</span>,
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
          <h1 className="text-xl font-bold text-text-primary">Venues</h1>
          <p className="mt-0.5 text-sm text-text-muted">Kelola data lapangan olahraga.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>+ Tambah Venue</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Venue",      value: venues.length,                                           color: "text-text-primary" },
          { label: "Aktif",            value: venues.filter((v) => v.status === "active").length,      color: "text-accent" },
          { label: "Nonaktif",         value: venues.filter((v) => v.status === "inactive").length,    color: "text-red-400" },
          { label: "Jenis Olahraga",   value: new Set(venues.map((v) => v.sportTypeId)).size,          color: "text-secondary" },
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
              <CardTitle>Daftar Venue</CardTitle>
              <CardDescription>{filtered.length} dari {venues.length} venue</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Input placeholder="Cari nama / lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<IconSearch />} />
              </div>
              <div className="w-40">
                <Select value={filterSport} onChange={(e) => setFilterSport(e.target.value)} options={SPORT_TYPE_OPTIONS} placeholder="Semua olahraga" />
              </div>
              <div className="w-36">
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[{ value: "active", label: "Aktif" }, { value: "inactive", label: "Nonaktif" }]} placeholder="Semua status" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} emptyMessage="Tidak ada venue ditemukan." loading={loading} onRefresh={handleRefresh} />
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
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Hapus</Button>
          </div>
        }
      >
        <p className="text-sm text-text-muted">
          Yakin ingin menghapus venue{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.name}</span>?
        </p>
        <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-300">
          Semua pricing rule yang terhubung ke venue ini juga akan ikut terhapus.
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
