"use client";

import { useMemo, useState } from "react";
import Badge, { type BadgeVariant } from "../../../../components/ui/Badge";
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

type DayType = "weekday" | "weekend" | "holiday";

type PricingRule = {
  id: string;
  venueId: string;
  venueName: string;
  label: string;
  dayType: DayType;
  startTime: string;
  endTime: string;
  pricePerHour: number;
};

type FormData = {
  venueId: string;
  label: string;
  dayType: string;
  startTime: string;
  endTime: string;
  pricePerHour: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const VENUE_OPTIONS = [
  { value: "v-1", label: "Padel Arena A" },
  { value: "v-2", label: "Padel Arena B" },
  { value: "v-3", label: "Futsal Prime" },
  { value: "v-4", label: "Mini Soccer 1" },
  { value: "v-5", label: "Badminton Hall" },
  { value: "v-6", label: "Tennis Indoor 1" },
];

const VENUE_NAME: Record<string, string> = Object.fromEntries(
  VENUE_OPTIONS.map((o) => [o.value, o.label])
);

const DAY_TYPE_OPTIONS = [
  { value: "weekday", label: "Hari Kerja (Senin–Jumat)" },
  { value: "weekend", label: "Akhir Pekan (Sabtu–Minggu)" },
  { value: "holiday", label: "Hari Libur Nasional" },
];

const DAY_TYPE_LABEL: Record<DayType, string> = {
  weekday: "Hari Kerja",
  weekend: "Akhir Pekan",
  holiday: "Hari Libur",
};

const DAY_TYPE_BADGE: Record<DayType, BadgeVariant> = {
  weekday: "info",
  weekend: "success",
  holiday: "warning",
};

const INITIAL_PRICING: PricingRule[] = [
  { id: "p-1", venueId: "v-1", venueName: "Padel Arena A",  label: "Off Peak",    dayType: "weekday", startTime: "06:00", endTime: "16:00", pricePerHour: 150000 },
  { id: "p-2", venueId: "v-1", venueName: "Padel Arena A",  label: "Peak Hours",  dayType: "weekday", startTime: "16:00", endTime: "22:00", pricePerHour: 250000 },
  { id: "p-3", venueId: "v-1", venueName: "Padel Arena A",  label: "Weekend",     dayType: "weekend", startTime: "06:00", endTime: "22:00", pricePerHour: 300000 },
  { id: "p-4", venueId: "v-3", venueName: "Futsal Prime",   label: "Off Peak",    dayType: "weekday", startTime: "08:00", endTime: "17:00", pricePerHour: 200000 },
  { id: "p-5", venueId: "v-3", venueName: "Futsal Prime",   label: "Peak Hours",  dayType: "weekday", startTime: "17:00", endTime: "23:00", pricePerHour: 350000 },
  { id: "p-6", venueId: "v-3", venueName: "Futsal Prime",   label: "Akhir Pekan", dayType: "weekend", startTime: "08:00", endTime: "23:00", pricePerHour: 400000 },
  { id: "p-7", venueId: "v-5", venueName: "Badminton Hall", label: "Reguler",     dayType: "weekday", startTime: "07:00", endTime: "22:00", pricePerHour: 80000  },
  { id: "p-8", venueId: "v-5", venueName: "Badminton Hall", label: "Weekend",     dayType: "weekend", startTime: "07:00", endTime: "22:00", pricePerHour: 120000 },
];

const EMPTY_FORM: FormData = {
  venueId: "", label: "", dayType: "weekday", startTime: "08:00", endTime: "22:00", pricePerHour: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

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

function IconTag() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function PricingContent() {
  const { push } = useToast();
  const [rules, setRules] = useState<PricingRule[]>(INITIAL_PRICING);
  const [filterVenue, setFilterVenue] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editTarget, setEditTarget] = useState<PricingRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PricingRule | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    return rules.filter((r) => {
      const matchVenue  = filterVenue ? r.venueId === filterVenue : true;
      const matchDay    = filterDay   ? r.dayType === filterDay   : true;
      const matchSearch = search
        ? r.label.toLowerCase().includes(search.toLowerCase()) ||
          r.venueName.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchVenue && matchDay && matchSearch;
    });
  }, [rules, filterVenue, filterDay, search]);

  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(r: PricingRule) {
    setEditTarget(r);
    setForm({
      venueId: r.venueId,
      label: r.label,
      dayType: r.dayType,
      startTime: r.startTime,
      endTime: r.endTime,
      pricePerHour: String(r.pricePerHour),
    });
    setErrors({});
    setFormOpen(true);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.venueId)            e.venueId = "Venue wajib dipilih";
    if (!form.label.trim())       e.label   = "Label wajib diisi";
    if (!form.dayType)            e.dayType = "Tipe hari wajib dipilih";
    if (!form.startTime)          e.startTime = "Jam mulai wajib diisi";
    if (!form.endTime)            e.endTime   = "Jam selesai wajib diisi";
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = "Jam selesai harus setelah jam mulai";
    const price = Number(form.pricePerHour);
    if (!form.pricePerHour || isNaN(price) || price < 1)
      e.pricePerHour = "Harga harus berupa angka positif";
    return e;
  }

  function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const venueName = VENUE_NAME[form.venueId] ?? "";

    if (editTarget) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? { ...r, venueId: form.venueId, venueName, label: form.label.trim(), dayType: form.dayType as DayType, startTime: form.startTime, endTime: form.endTime, pricePerHour: Number(form.pricePerHour) }
            : r
        )
      );
      push({ title: "Pricing diperbarui", description: `${form.label} berhasil diupdate.`, variant: "success" });
    } else {
      const newRule: PricingRule = {
        id: `p-${Date.now()}`,
        venueId: form.venueId,
        venueName,
        label: form.label.trim(),
        dayType: form.dayType as DayType,
        startTime: form.startTime,
        endTime: form.endTime,
        pricePerHour: Number(form.pricePerHour),
      };
      setRules((prev) => [newRule, ...prev]);
      push({ title: "Pricing ditambahkan", description: `${form.label} berhasil ditambahkan.`, variant: "success" });
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    push({ title: "Pricing dihapus", description: `${deleteTarget.label} telah dihapus.`, variant: "success" });
    setDeleteTarget(null);
  }

  const avgPrice = rules.length
    ? Math.round(rules.reduce((s, r) => s + r.pricePerHour, 0) / rules.length)
    : 0;

  const maxPrice = rules.length ? Math.max(...rules.map((r) => r.pricePerHour)) : 0;

  const columns: Column<PricingRule>[] = [
    {
      key: "venueName",
      header: "Venue",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconTag />
          </div>
          <span className="font-medium text-text-primary">{row.venueName}</span>
        </div>
      ),
    },
    {
      key: "label",
      header: "Label",
      render: (row) => <span className="text-text-primary">{row.label}</span>,
    },
    {
      key: "dayType",
      header: "Tipe Hari",
      align: "center",
      render: (row) => (
        <Badge variant={DAY_TYPE_BADGE[row.dayType]}>
          {DAY_TYPE_LABEL[row.dayType]}
        </Badge>
      ),
    },
    {
      key: "startTime",
      header: "Jam",
      align: "center",
      render: (row) => (
        <span className="font-mono text-sm text-text-muted">
          {row.startTime} – {row.endTime}
        </span>
      ),
    },
    {
      key: "pricePerHour",
      header: "Harga / Jam",
      align: "right",
      render: (row) => (
        <span className="font-semibold text-accent">
          {formatRupiah(row.pricePerHour)}
        </span>
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
          <p className="text-xs uppercase tracking-widest text-text-muted">Master Data</p>
          <h1 className="text-xl font-bold text-text-primary">Pricing Rules</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Atur harga per jam untuk setiap venue dan tipe hari.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          + Tambah Rule
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Rule",    value: rules.length,              color: "text-text-primary", fmt: false },
          { label: "Venue Aktif",   value: new Set(rules.map(r => r.venueId)).size, color: "text-secondary", fmt: false },
          { label: "Rata-rata Harga", value: avgPrice,                color: "text-accent",       fmt: true },
          { label: "Harga Tertinggi", value: maxPrice,                color: "text-primary",      fmt: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/60 px-4 py-3">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`mt-0.5 text-lg font-bold ${s.color}`}>
              {s.fmt ? formatRupiah(s.value) : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Daftar Pricing Rules</CardTitle>
              <CardDescription>{filtered.length} dari {rules.length} rule</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-44">
                <Input
                  placeholder="Cari label / venue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<IconSearch />}
                />
              </div>
              <div className="w-40">
                <Select
                  value={filterVenue}
                  onChange={(e) => setFilterVenue(e.target.value)}
                  options={VENUE_OPTIONS}
                  placeholder="Semua venue"
                />
              </div>
              <div className="w-36">
                <Select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  options={DAY_TYPE_OPTIONS.map(d => ({ value: d.value, label: d.value === "weekday" ? "Hari Kerja" : d.value === "weekend" ? "Akhir Pekan" : "Hari Libur" }))}
                  placeholder="Semua hari"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            emptyMessage="Tidak ada pricing rule ditemukan."
          />
        </CardContent>
      </Card>

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        title={editTarget ? "Edit Pricing Rule" : "Tambah Pricing Rule"}
        description="Tentukan harga per jam berdasarkan venue dan tipe hari."
        onClose={() => setFormOpen(false)}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editTarget ? "Simpan Perubahan" : "Tambah Rule"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Venue"
              value={form.venueId}
              onChange={(e) => setForm((f) => ({ ...f, venueId: e.target.value }))}
              options={VENUE_OPTIONS}
              placeholder="Pilih venue..."
              error={errors.venueId}
            />
            <Select
              label="Tipe Hari"
              value={form.dayType}
              onChange={(e) => setForm((f) => ({ ...f, dayType: e.target.value }))}
              options={DAY_TYPE_OPTIONS}
              error={errors.dayType}
            />
          </div>

          <Input
            label="Label Rule"
            placeholder="cth. Peak Hours, Off Peak, Weekend..."
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            error={errors.label}
            hint="Label ini akan ditampilkan saat member memilih slot."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jam Mulai"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              error={errors.startTime}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              error={errors.endTime}
            />
          </div>

          <Input
            label="Harga per Jam (Rp)"
            type="number"
            min={1000}
            step={5000}
            placeholder="cth. 150000"
            value={form.pricePerHour}
            onChange={(e) => setForm((f) => ({ ...f, pricePerHour: e.target.value }))}
            error={errors.pricePerHour}
            hint={form.pricePerHour && !isNaN(Number(form.pricePerHour)) ? `= ${formatRupiah(Number(form.pricePerHour))}` : undefined}
          />
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        title="Hapus Pricing Rule"
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
          Yakin ingin menghapus rule{" "}
          <span className="font-semibold text-text-primary">{deleteTarget?.label}</span>{" "}
          untuk <span className="font-semibold text-text-primary">{deleteTarget?.venueName}</span>?
        </p>
      </Modal>
    </div>
  );
}

export default function PricingPage() {
  return (
    <ToastProvider>
      <PricingContent />
    </ToastProvider>
  );
}
