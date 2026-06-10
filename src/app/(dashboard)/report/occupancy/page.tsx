"use client";

import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import Select from "../../../../components/ui/Select";
import { ToastProvider } from "../../../../components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type VenueOccupancy = {
  id: string;
  name: string;
  sportType: string;
  totalSlots: number;
  bookedSlots: number;
  occupancyRate: number;
  peakHour: string;
  revenue: number;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA: VenueOccupancy[] = [
  { id: "v-1", name: "Lapangan Padel A",     sportType: "Padel",       totalSlots: 168, bookedSlots: 143, occupancyRate: 85, peakHour: "18:00–20:00", revenue: 14300000 },
  { id: "v-2", name: "Lapangan Futsal 1",    sportType: "Futsal",      totalSlots: 168, bookedSlots: 130, occupancyRate: 77, peakHour: "19:00–21:00", revenue: 9750000  },
  { id: "v-3", name: "Lapangan Futsal 2",    sportType: "Futsal",      totalSlots: 168, bookedSlots: 118, occupancyRate: 70, peakHour: "20:00–22:00", revenue: 8850000  },
  { id: "v-4", name: "Lapangan Badminton A", sportType: "Badminton",   totalSlots: 168, bookedSlots: 105, occupancyRate: 63, peakHour: "07:00–09:00", revenue: 5250000  },
  { id: "v-5", name: "Lapangan Badminton B", sportType: "Badminton",   totalSlots: 168, bookedSlots:  98, occupancyRate: 58, peakHour: "07:00–09:00", revenue: 4900000  },
  { id: "v-6", name: "Mini Soccer 1",        sportType: "Mini Soccer", totalSlots: 168, bookedSlots:  84, occupancyRate: 50, peakHour: "17:00–19:00", revenue: 8400000  },
  { id: "v-7", name: "Tennis Indoor",        sportType: "Tennis",      totalSlots: 168, bookedSlots:  59, occupancyRate: 35, peakHour: "16:00–18:00", revenue: 7080000  },
];

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

const YEARS = ["2026","2025","2024"];

const SPORT_TYPES = ["Semua", "Padel", "Futsal", "Badminton", "Mini Soccer", "Tennis"];

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)     return `Rp ${(n / 1_000).toFixed(0)}k`;
  return `Rp ${n}`;
}

// ─── Color for occupancy rate ─────────────────────────────────────────────────

function rateColor(rate: number) {
  if (rate >= 80) return { bar: "bg-accent",      text: "text-accent",      badge: "success" as const };
  if (rate >= 60) return { bar: "bg-secondary",   text: "text-secondary",   badge: "info"    as const };
  if (rate >= 40) return { bar: "bg-yellow-400",  text: "text-yellow-400",  badge: "warning" as const };
  return            { bar: "bg-red-400",       text: "text-red-400",     badge: "error"   as const };
}

// ─── Horizontal bar chart row ─────────────────────────────────────────────────

function OccupancyBar({ venue }: { venue: VenueOccupancy }) {
  const cfg = rateColor(venue.occupancyRate);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{venue.name}</span>
          <Badge variant="muted">{venue.sportType}</Badge>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${cfg.text}`}>{venue.occupancyRate}%</span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2/60">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${venue.occupancyRate}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{venue.bookedSlots}/{venue.totalSlots} slot terisi · Peak: {venue.peakHour}</span>
        <span>{formatRp(venue.revenue)}</span>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface/60 px-4 py-3.5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ?? "text-text-primary"}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function OccupancyContent() {
  const [month, setMonth] = useState("4");
  const [year, setYear]   = useState("2026");
  const [sport, setSport] = useState("Semua");

  const displayed = MOCK_DATA.filter(
    (v) => sport === "Semua" || v.sportType === sport
  );

  const totalBooked  = displayed.reduce((a, b) => a + b.bookedSlots,  0);
  const totalSlots   = displayed.reduce((a, b) => a + b.totalSlots,   0);
  const avgOccupancy = totalSlots > 0 ? Math.round((totalBooked / totalSlots) * 100) : 0;
  const bestVenue    = [...displayed].sort((a, b) => b.occupancyRate - a.occupancyRate)[0];
  const peakHour     = "18:00–20:00";

  const sorted = [...displayed].sort((a, b) => b.occupancyRate - a.occupancyRate);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Laporan</p>
          <h1 className="text-xl font-bold text-text-primary">Laporan Okupansi</h1>
          <p className="mt-0.5 text-sm text-text-muted">Tingkat pemakaian lapangan per venue per periode.</p>
        </div>
        {/* Filters */}
        <div className="flex gap-2">
          <div className="w-36">
            <Select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
            />
          </div>
          <div className="w-24">
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={YEARS.map((y) => ({ value: y, label: y }))}
            />
          </div>
          <div className="w-40">
            <Select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              options={SPORT_TYPES.map((s) => ({ value: s, label: s }))}
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Booking"   value={String(totalBooked)}     sub={`dari ${totalSlots} slot tersedia`} />
        <StatCard label="Rata-rata Okupansi" value={`${avgOccupancy}%`}   accent={rateColor(avgOccupancy).text} sub="semua venue dipilih" />
        <StatCard label="Venue Terbaik"   value={bestVenue?.name ?? "—"}  sub={bestVenue ? `${bestVenue.occupancyRate}% terisi` : ""} />
        <StatCard label="Jam Tersibuk"    value={peakHour}                sub="paling banyak booking" />
      </div>

      {/* Bar chart card */}
      <Card>
        <CardHeader>
          <CardTitle>Tingkat Okupansi per Venue</CardTitle>
          <CardDescription>
            {MONTHS[parseInt(month) - 1]} {year} · {displayed.length} venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayed.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Tidak ada data untuk filter yang dipilih.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {sorted.map((v) => (
                <OccupancyBar key={v.id} venue={v} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian per Venue</CardTitle>
          <CardDescription>Data lengkap slot dan pendapatan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Venue", "Jenis", "Slot Terisi", "Total Slot", "Okupansi", "Peak Hour", "Pendapatan"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-text-muted first:pl-0 last:pr-0 last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((v) => {
                  const cfg = rateColor(v.occupancyRate);
                  return (
                    <tr key={v.id} className="transition hover:bg-surface-2/30">
                      <td className="py-3 pl-0 pr-3 font-medium text-text-primary">{v.name}</td>
                      <td className="px-3 py-3">
                        <Badge variant="muted">{v.sportType}</Badge>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-text-muted">{v.bookedSlots}</td>
                      <td className="px-3 py-3 tabular-nums text-text-muted">{v.totalSlots}</td>
                      <td className="px-3 py-3">
                        <Badge variant={cfg.badge}>{v.occupancyRate}%</Badge>
                      </td>
                      <td className="px-3 py-3 text-text-muted">{v.peakHour}</td>
                      <td className="py-3 pl-3 pr-0 text-right font-medium text-text-primary tabular-nums">
                        {formatRp(v.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={2} className="py-3 pl-0 pr-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Total</td>
                  <td className="px-3 py-3 font-semibold tabular-nums text-text-primary">{totalBooked}</td>
                  <td className="px-3 py-3 font-semibold tabular-nums text-text-primary">{totalSlots}</td>
                  <td className={`px-3 py-3 font-semibold ${rateColor(avgOccupancy).text}`}>{avgOccupancy}%</td>
                  <td className="px-3 py-3" />
                  <td className="py-3 pl-3 pr-0 text-right font-bold text-text-primary tabular-nums">
                    {formatRp(displayed.reduce((a, b) => a + b.revenue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OccupancyReportPage() {
  return (
    <ToastProvider>
      <OccupancyContent />
    </ToastProvider>
  );
}
