"use client";

import { useState, useMemo } from "react";
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
  status: "active" | "inactive";
};

type FormData = {
  name: string;
  sportTypeId: string;
  capacity: string;
  location: string;
  description: string;
  active: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

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
  { id: "v-1", name: "Padel Arena A",   sportTypeId: "st-1", sportTypeName: "Padel",        capacity: 4,  location: "Lantai 2, Gedung Sport Center", description: "Lapangan padel premium dengan kaca tempered.", status: "active" },
  { id: "v-2", name: "Padel Arena B",   sportTypeId: "st-1", sportTypeName: "Padel",        capacity: 4,  location: "Lantai 2, Gedung Sport Center", description: "", status: "active" },
  { id: "v-3", name: "Futsal Prime",    sportTypeId: "st-2", sportTypeName: "Futsal",       capacity: 14, location: "Lantai 1, Gedung Sport Center", description: "Lapangan futsal dengan rumput sintetis premium.", status: "active" },
  { id: "v-4", name: "Mini Soccer 1",   sportTypeId: "st-3", sportTypeName: "Mini Soccer",  capacity: 16, location: "Outdoor, Area A",               description: "", status: "active" },
  { id: "v-5", name: "Badminton Hall",  sportTypeId: "st-4", sportTypeName: "Badminton",    capacity: 4,  location: "Lantai 3, Gedung Sport Center", description: "", status: "active" },
  { id: "v-6", name: "Tennis Indoor 1", sportTypeId: "st-5", sportTypeName: "Tennis Indoor",capacity: 4,  location: "Lantai 3, Gedung Sport Center", description: "Sedang dalam renovasi.", status: "inactive" },
];

const EMPTY_FORM: FormData = {
  name: "", sportTypeId: "", capacity: "", location: "", description: "", active: true,
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

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 22V12h6v10M3 9h18" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function VenuesContent() {
  const { push } = useToast();
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [search, setSearch] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  function handleRefresh() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  }
  const [errors, setErrors] = useState<FormErrors>({});
  const [editTarget, setEditTarget] = useState<Venue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Venue | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.location.toLowerCase().includes(search.toLowerCase());
      const matchSport = filterSport ? v.sportTypeId === filterSport : true;
      const matchStatus = filterStatus ? v.status === filterStatus : true;
      return matchSearch && matchSport && matchStatus;
    });
  }, [venues, search, filterSport, filterStatus]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(v: Venue) {
    setEditTarget(v);
    setForm({
      name: v.name,
      sportTypeId: v.sportTypeId,
      capacity: String(v.capacity),
      location: v.location,
      description: v.description,
      active: v.status === "active",
    });
    setErrors({});
    setFormOpen(true);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim())       e.name = "Nama venue wajib diisi";
    if (!form.sportTypeId)       e.sportTypeId = "Jenis olahraga wajib dipilih";
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
      e.capacity = "Kapasitas harus berupa angka positif";
    if (!form.location.trim())   e.location = "Lokasi wajib diisi";
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
            ? { ...v, name: form.name.trim(), sportTypeId: form.sportTypeId, sportTypeName, capacity: Number(form.capacity), location: form.location.trim(), description: form.description.trim(), status: form.active ? "active" : "inactive" }
            : v
        )
      );
      push({ title: "Venue diperbarui", description: `${form.name} berhasil diupdate.`, variant: "success" });
    } else {
      const newVenue: Venue = {
        id: `v-${Date.now()}`,
        name: form.name.trim(),
        sportTypeId: form.sportTypeId,
        sportTypeName,
        capacity: Number(form.capacity),
        location: form.location.trim(),
        description: form.description.trim(),
        status: form.active ? "active" : "inactive",
      };
      setVenues((prev) => [newVenue, ...prev]);
      push({ title: "Venue ditambahkan", description: `${form.name} berhasil ditambahkan.`, variant: "success" });
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setVenues((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    push({ title: "Venue dihapus", description: `${deleteTarget.name} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  const columns: Column<Venue>[] = [
    {
      key: "name",
      header: "Nama Venue",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconBuilding />
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
        row.status === "active" ? (
          <Badge variant="success" dot>Aktif</Badge>
        ) : (
          <Badge variant="muted" dot>Nonaktif</Badge>
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

  const activeCount = venues.filter((v) => v.status === "active").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Master Data</p>
          <h1 className="text-xl font-bold text-text-primary">Venues</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Kelola data lapangan olahraga. {activeCount} venue aktif.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Tambah Venue
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Venue",  value: venues.length, color: "text-text-primary" },
          { label: "Aktif",        value: venues.filter(v => v.status === "active").length,   color: "text-accent" },
          { label: "Nonaktif",     value: venues.filter(v => v.status === "inactive").length, color: "text-red-400" },
          { label: "Jenis Olahraga", value: new Set(venues.map(v => v.sportTypeId)).size,     color: "text-secondary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`mt-0.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Venue</CardTitle>
              <CardDescription>{filtered.length} dari {venues.length} venue</CardDescription>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-48">
                <Input
                  placeholder="Cari nama / lokasi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<IconSearch />}
                />
              </div>
              <div className="w-40">
                <Select
                  value={filterSport}
                  onChange={(e) => setFilterSport(e.target.value)}
                  options={SPORT_TYPE_OPTIONS}
                  placeholder="Semua olahraga"
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
            emptyMessage="Tidak ada venue ditemukan."
            loading={loading}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        variant={editTarget ? "edit" : "create"}
        title={editTarget ? "Edit Venue" : "Tambah Venue"}
        description={editTarget ? `Perbarui data ${editTarget.name}.` : "Isi detail venue baru."}
        onClose={() => setFormOpen(false)}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editTarget ? "Simpan Perubahan" : "Tambah Venue"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
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
            label="Lokasi / Alamat"
            placeholder="cth. Lantai 2, Gedung Sport Center"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            error={errors.location}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              Deskripsi
            </label>
            <textarea
              rows={3}
              placeholder="Informasi tambahan tentang venue..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full resize-none rounded-xl border border-border bg-surface/60 px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-all focus:border-secondary/60 focus:ring-2 focus:ring-secondary/10"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-ink-2/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">Status Venue</p>
              <p className="text-xs text-text-muted">
                {form.active ? "Venue aktif dan dapat dibooking" : "Venue nonaktif, tidak muncul di pencarian"}
              </p>
            </div>
            <Toggle
              checked={form.active}
              onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              label="Status venue"
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
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
