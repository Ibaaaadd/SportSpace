"use client";

import { useState } from "react";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../components/ui/Card";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import Modal from "../../../components/ui/Modal";
import Toggle from "../../../components/ui/Toggle";
import { ToastProvider, useToast } from "../../../components/ui/Toast";

// ---------- Stat cards ----------

type Stat = {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: React.ReactNode;
  color: string;
};

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconMoney() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 1 1 14 0c0 5-7 12.5-7 12.5z" />
      <circle cx="12" cy="8.5" r="2.5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17l5-5 3 3 4-6" />
      <path d="M14 9h4v4" />
    </svg>
  );
}

function IconTrendDown() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7l5 5 3-3 4 6" />
      <path d="M14 15h4v-4" />
    </svg>
  );
}

const stats: Stat[] = [
  {
    label: "Booking Hari Ini",
    value: "128",
    trend: "+12% vs kemarin",
    up: true,
    icon: <IconCalendar />,
    color: "text-primary bg-primary/15",
  },
  {
    label: "Pendapatan",
    value: "Rp 12.4M",
    trend: "+8.3% bulan ini",
    up: true,
    icon: <IconMoney />,
    color: "text-accent bg-accent/15",
  },
  {
    label: "Lapangan Aktif",
    value: "42",
    trend: "−2 dari kemarin",
    up: false,
    icon: <IconMapPin />,
    color: "text-secondary bg-secondary/15",
  },
  {
    label: "Waiting List",
    value: "18",
    trend: "+5 sejak pagi",
    up: false,
    icon: <IconClock />,
    color: "text-yellow-400 bg-yellow-400/15",
  },
];

function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface/80 p-5 shadow-[0_0_20px_rgba(0,0,0,0.15)] transition hover:border-border/80 hover:shadow-[0_0_28px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
          {stat.icon}
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            stat.up
              ? "bg-accent/10 text-accent"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {stat.up ? <IconTrendUp /> : <IconTrendDown />}
          {stat.up ? "↑" : "↓"}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-text-primary">{stat.value}</p>
        <p className="mt-0.5 text-xs text-text-muted">{stat.label}</p>
      </div>
      <p className={`text-[11px] font-medium ${stat.up ? "text-accent" : "text-red-400"}`}>
        {stat.trend}
      </p>
    </div>
  );
}

// ---------- Booking table ----------

type BookingRow = {
  id: string;
  venue: string;
  slot: string;
  member: string;
  status: string;
};

const bookings: BookingRow[] = [
  { id: "BK-4821", venue: "Padel Arena A", slot: "18:00 – 19:00", member: "Rama Fadil", status: "Paid" },
  { id: "BK-4819", venue: "Mini Soccer 2", slot: "17:00 – 18:00", member: "Sinta Halim", status: "Pending" },
  { id: "BK-4813", venue: "Futsal Prime", slot: "16:00 – 17:00", member: "Agus Rahman", status: "Paid" },
  { id: "BK-4802", venue: "Tennis Indoor", slot: "20:00 – 21:00", member: "Dina Laras", status: "Waiting" },
  { id: "BK-4798", venue: "Badminton Hall", slot: "15:00 – 16:00", member: "Rizky Putra", status: "Paid" },
];

const statusBadge = (status: string) => {
  if (status === "Paid") return <Badge variant="success" dot>{status}</Badge>;
  if (status === "Pending") return <Badge variant="info" dot>{status}</Badge>;
  return <Badge variant="warning" dot>{status}</Badge>;
};

const columns: Column<BookingRow>[] = [
  {
    key: "id",
    header: "Booking ID",
    render: (row) => <span className="font-mono text-xs font-semibold text-text-muted">{row.id}</span>,
  },
  { key: "venue", header: "Venue" },
  {
    key: "slot",
    header: "Waktu",
    render: (row) => <span className="text-xs text-text-muted">{row.slot}</span>,
  },
  {
    key: "member",
    header: "Member",
    render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar name={row.member} size="xs" />
        <span>{row.member}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (row) => statusBadge(row.status),
  },
];

// ---------- Operational notes ----------

const notes = [
  { text: "3 venue butuh konfirmasi promo weekend.", level: "warning" as const },
  { text: "Antrian pembayaran meningkat di jam 18:00–20:00.", level: "info" as const },
  { text: "Slot malam hampir penuh untuk padel & futsal.", level: "error" as const },
];

const noteLevelStyles = {
  warning: "border-yellow-400/30 bg-yellow-400/5 text-yellow-300",
  info: "border-secondary/30 bg-secondary/5 text-secondary",
  error: "border-red-500/30 bg-red-500/5 text-red-300",
};

// ---------- Main page ----------

function DashboardContent() {
  const { push } = useToast();
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Page header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Overview</p>
          <h1 className="text-xl font-bold text-text-primary">Sport Space Dashboard</h1>
          <p className="mt-0.5 text-sm text-text-muted capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            checked={autoConfirm}
            onCheckedChange={setAutoConfirm}
            label="Auto confirm"
          />
          <span className="text-xs text-text-muted">Auto konfirmasi</span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            Quick Update
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

       {/* Main grid */}
       <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

         {/* Recent bookings */}
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <div>
                 <CardTitle>Recent Bookings</CardTitle>
                 <CardDescription>Transaksi terbaru dari semua venue.</CardDescription>
               </div>
               <Button variant="outline" size="sm">
                 Lihat Semua
               </Button>
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((booking) => (
                   <div key={booking.id} className="rounded-lg border border-border bg-surface/50 p-3">
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="font-mono text-xs font-semibold text-text-muted">{booking.id}</span>
                         {statusBadge(booking.status)}
                       </div>
                       <p className="text-sm font-medium">{booking.venue}</p>
                       <div className="text-xs text-text-muted">
                         <p>{booking.slot}</p>
                         <div className="flex items-center gap-2 mt-2">
                           <Avatar name={booking.member} size="xs" />
                           <span>{booking.member}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>

               {Math.ceil(bookings.length / itemsPerPage) > 1 && (
                 <div className="flex items-center justify-center gap-2 pt-2">
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={currentPage === 1}
                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   >
                     Prev
                   </Button>
                   <div className="flex items-center gap-1">
                     {Array.from({ length: Math.ceil(bookings.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                       <button
                         key={page}
                         onClick={() => setCurrentPage(page)}
                         className={`h-6 w-6 text-xs font-medium rounded transition ${
                           currentPage === page
                             ? 'bg-primary text-surface'
                             : 'border border-border text-text-primary hover:border-primary'
                         }`}
                       >
                         {page}
                       </button>
                     ))}
                   </div>
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={currentPage === Math.ceil(bookings.length / itemsPerPage)}
                     onClick={() => setCurrentPage(p => Math.min(Math.ceil(bookings.length / itemsPerPage), p + 1))}
                   >
                     Next
                   </Button>
                 </div>
               )}
             </div>
           </CardContent>
         </Card>

        {/* Right panel */}
        <div className="flex flex-col gap-4">

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Akses cepat untuk admin.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
                variant="secondary"
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
                variant="outline"
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

          {/* Operational notes */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Notes</CardTitle>
              <CardDescription>Insight yang perlu diperhatikan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {notes.map((note) => (
                <div
                  key={note.text}
                  className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${noteLevelStyles[note.level]}`}
                >
                  {note.text}
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
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal */}
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
                  description: "Catatan operasional sudah disebarkan ke semua admin.",
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
          pastikan pricing sudah sesuai dengan jadwal hari ini.
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
