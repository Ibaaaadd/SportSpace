"use client";

import { useState } from "react";
import Button from "../../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Modal from "../../../components/ui/Modal";
import Toggle from "../../../components/ui/Toggle";
import { ToastProvider, useToast } from "../../../components/ui/Toast";

const stats = [
  { label: "Booking Hari Ini", value: "128" },
  { label: "Pendapatan", value: "Rp 12.4M" },
  { label: "Lapangan Aktif", value: "42" },
  { label: "Waiting List", value: "18" },
];

type BookingRow = {
  id: string;
  venue: string;
  slot: string;
  member: string;
  status: string;
};

const bookings: BookingRow[] = [
  {
    id: "BK-4821",
    venue: "Padel Arena A",
    slot: "18:00 - 19:00",
    member: "Rama Fadil",
    status: "Paid",
  },
  {
    id: "BK-4819",
    venue: "Mini Soccer 2",
    slot: "17:00 - 18:00",
    member: "Sinta Halim",
    status: "Pending",
  },
  {
    id: "BK-4813",
    venue: "Futsal Prime",
    slot: "16:00 - 17:00",
    member: "Agus Rahman",
    status: "Paid",
  },
  {
    id: "BK-4802",
    venue: "Tennis Indoor",
    slot: "20:00 - 21:00",
    member: "Dina Laras",
    status: "Waiting",
  },
];

const columns: Column<BookingRow>[] = [
  { key: "id", header: "Booking" },
  { key: "venue", header: "Venue" },
  { key: "slot", header: "Slot" },
  { key: "member", header: "Member" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <span
        className={`rounded-full border px-3 py-1 text-xs ${
          row.status === "Paid"
            ? "border-accent/60 text-accent"
            : row.status === "Pending"
            ? "border-secondary/60 text-secondary"
            : "border-yellow-400/60 text-yellow-300"
        }`}
      >
        {row.status}
      </span>
    ),
    align: "center",
  },
];

function DashboardContent() {
  const { push } = useToast();
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              Dashboard
            </p>
            <CardTitle>Sport Space Control Center</CardTitle>
            <CardDescription>
              Ringkasan performa dan aktivitas booking terbaru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border bg-ink-2 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-3">
              <Toggle
                checked={autoConfirm}
                onCheckedChange={setAutoConfirm}
                label="Auto confirm"
              />
              <div className="text-xs text-text-muted">
                Auto konfirmasi booking setelah payment sukses.
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              Quick Update
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Akses cepat untuk admin.</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() =>
                push({
                  title: "Broadcast dikirim",
                  description: "Notifikasi update jadwal sudah terkirim.",
                  variant: "success",
                })
              }
            >
              Send Broadcast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                push({
                  title: "Sync pricing",
                  description: "Pricing rules berhasil disinkronkan.",
                  variant: "info",
                })
              }
            >
              Sync Pricing
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                push({
                  title: "Audit selesai",
                  description: "Tidak ada jadwal bentrok terdeteksi.",
                  variant: "warning",
                })
              }
            >
              Run Audit
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Pantau transaksi terbaru dari semua venue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={bookings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Notes</CardTitle>
            <CardDescription>
              Insight yang perlu diperhatikan hari ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "3 venue butuh konfirmasi promo weekend.",
              "Antrian pembayaran meningkat di jam 18:00 - 20:00.",
              "Slot malam hampir penuh untuk padel dan futsal.",
            ].map((note) => (
              <div
                key={note}
                className="rounded-2xl border border-border bg-ink-2 px-4 py-3 text-sm"
              >
                {note}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                push({
                  title: "Report generated",
                  description: "Laporan occupancy dikirim ke email admin.",
                  variant: "success",
                })
              }
            >
              Generate Report
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
              View Tasks
            </Button>
          </CardFooter>
        </Card>
      </section>

      <Modal
        open={modalOpen}
        title="Quick Update"
        description="Catatan singkat untuk tim operasional hari ini."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                push({
                  title: "Update tersimpan",
                  description: "Catatan operasional sudah disebarkan.",
                  variant: "success",
                });
              }}
            >
              Save Update
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-muted">
          Semua admin akan menerima reminder untuk cek kapasitas prime time dan
          pastikan pricing sudah sesuai.
        </p>
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
