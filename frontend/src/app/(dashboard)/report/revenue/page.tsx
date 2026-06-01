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

type DailyRevenue = { day: string; date: string; amount: number; transactions: number };

type VenueRevenue = {
  id: string;
  name: string;
  sportType: string;
  revenue: number;
  transactions: number;
  avgPerSession: number;
  growth: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}k`;
  return `Rp ${n}`;
}

function formatRpFull(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const DAILY_DATA: DailyRevenue[] = [
  { day: "Sen", date: "19 Mei", amount: 8_250_000,  transactions: 22 },
  { day: "Sel", date: "20 Mei", amount: 6_100_000,  transactions: 17 },
  { day: "Rab", date: "21 Mei", amount: 7_400_000,  transactions: 19 },
  { day: "Kam", date: "22 Mei", amount: 9_800_000,  transactions: 26 },
  { day: "Jum", date: "23 Mei", amount: 12_500_000, transactions: 33 },
  { day: "Sab", date: "24 Mei", amount: 18_300_000, transactions: 48 },
  { day: "Min", date: "25 Mei", amount: 15_700_000, transactions: 41 },
];

const VENUE_DATA: VenueRevenue[] = [
  { id: "v-1", name: "Lapangan Padel A",     sportType: "Padel",       revenue: 14_300_000, transactions: 143, avgPerSession: 100_000, growth:  12.5 },
  { id: "v-2", name: "Lapangan Futsal 1",    sportType: "Futsal",      revenue:  9_750_000, transactions: 130, avgPerSession:  75_000, growth:   5.2 },
  { id: "v-3", name: "Lapangan Futsal 2",    sportType: "Futsal",      revenue:  8_850_000, transactions: 118, avgPerSession:  75_000, growth:  -2.1 },
  { id: "v-4", name: "Lapangan Badminton A", sportType: "Badminton",   revenue:  5_250_000, transactions: 105, avgPerSession:  50_000, growth:   8.0 },
  { id: "v-5", name: "Lapangan Badminton B", sportType: "Badminton",   revenue:  4_900_000, transactions:  98, avgPerSession:  50_000, growth:  -1.5 },
  { id: "v-6", name: "Mini Soccer 1",        sportType: "Mini Soccer", revenue:  8_400_000, transactions:  84, avgPerSession: 100_000, growth:  18.3 },
  { id: "v-7", name: "Tennis Indoor",        sportType: "Tennis",      revenue:  7_080_000, transactions:  59, avgPerSession: 120_000, growth:   3.7 },
];

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];
const YEARS = ["2026","2025","2024"];

// ─── Bar chart ────────────────────────────────────────────────────────────────

function DailyBarChart({ data }: { data: DailyRevenue[] }) {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d) => {
        const pct = max > 0 ? (d.amount / max) * 100 : 0;
        return (
          <div key={d.day} className="group flex flex-1 flex-col items-center gap-1.5">
            {/* Tooltip on hover */}
            <div className="relative flex w-full flex-1 flex-col justify-end">
              <div className="mb-1 hidden flex-col items-center group-hover:flex">
                <div className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-center shadow-lg">
                  <p className="text-xs font-semibold text-text-primary">{formatRp(d.amount)}</p>
                  <p className="text-[10px] text-text-muted">{d.transactions} transaksi</p>
                </div>
                <div className="h-1.5 w-px bg-border" />
              </div>
              <div
                className="w-full rounded-t-lg bg-linear-to-t from-primary/80 to-secondary/80 transition-all duration-500 group-hover:from-primary group-hover:to-secondary"
                style={{ height: `${pct}%`, minHeight: "6px" }}
              />
            </div>
            <p className="text-xs font-medium text-text-muted">{d.day}</p>
            <p className="hidden text-[10px] text-text-muted/60 sm:block">{d.date}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, trend,
}: {
  label: string; value: string; sub?: string; accent?: string;
  trend?: { value: string; up: boolean };
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface/60 px-4 py-3.5">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ?? "text-text-primary"}`}>{value}</p>
      <div className="flex items-center gap-2">
        {sub && <p className="text-xs text-text-muted">{sub}</p>}
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend.up ? "text-accent" : "text-red-400"}`}>
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function RevenueContent() {
  const [month, setMonth] = useState("5");
  const [year, setYear]   = useState("2026");

  const totalRevenue     = VENUE_DATA.reduce((a, b) => a + b.revenue, 0);
  const totalTransactions = VENUE_DATA.reduce((a, b) => a + b.transactions, 0);
  const avgPerDay        = Math.round(totalRevenue / 30);
  const prevMonthRevenue = Math.round(totalRevenue * 0.88);
  const growthPct        = (((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1);

  const sorted = [...VENUE_DATA].sort((a, b) => b.revenue - a.revenue);
  const topRevenue = sorted[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted">Laporan</p>
          <h1 className="text-xl font-bold text-text-primary">Laporan Pendapatan</h1>
          <p className="mt-0.5 text-sm text-text-muted">Ringkasan pendapatan booking per periode dan per venue.</p>
        </div>
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
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Total Pendapatan"
          value={formatRp(totalRevenue)}
          sub="bulan ini"
          accent="text-accent"
          trend={{ value: `${growthPct}%`, up: true }}
        />
        <StatCard
          label="vs Bulan Lalu"
          value={formatRp(prevMonthRevenue)}
          sub={`selisih +${formatRp(totalRevenue - prevMonthRevenue)}`}
        />
        <StatCard
          label="Rata-rata / Hari"
          value={formatRp(avgPerDay)}
          sub="30 hari aktif"
        />
        <StatCard
          label="Total Transaksi"
          value={String(totalTransactions)}
          sub={`avg ${formatRp(Math.round(totalRevenue / totalTransactions))} / sesi`}
        />
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pendapatan 7 Hari Terakhir</CardTitle>
              <CardDescription>
                {MONTHS[parseInt(month) - 1]} {year} · {DAILY_DATA.reduce((a, b) => a + b.transactions, 0)} transaksi
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Total 7 hari</p>
              <p className="text-lg font-bold text-accent tabular-nums">
                {formatRp(DAILY_DATA.reduce((a, b) => a + b.amount, 0))}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DailyBarChart data={DAILY_DATA} />
        </CardContent>
      </Card>

      {/* Per-venue breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pendapatan per Venue</CardTitle>
              <CardDescription>{sorted.length} venue aktif · {MONTHS[parseInt(month) - 1]} {year}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Venue terbaik</p>
              <p className="text-sm font-semibold text-text-primary">{topRevenue?.name ?? "—"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Venue", "Jenis", "Pendapatan", "Transaksi", "Rata-rata/Sesi", "Growth"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-text-muted ${
                        i === 0 ? "pl-0 w-8 text-center" : i >= 3 ? "text-right" : "text-left"
                      } last:pr-0`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((v, idx) => (
                  <tr key={v.id} className="transition hover:bg-surface-2/30">
                    <td className="py-3 pl-0 pr-3 text-center text-xs text-text-muted">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">{v.name}</span>
                        {/* inline bar */}
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2/60">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-primary/70 to-secondary/70"
                            style={{ width: `${(v.revenue / sorted[0].revenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="muted">{v.sportType}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-text-primary">
                      {formatRpFull(v.revenue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-muted">{v.transactions}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-text-muted">
                      {formatRpFull(v.avgPerSession)}
                    </td>
                    <td className="py-3 pl-3 pr-0 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${v.growth >= 0 ? "text-accent" : "text-red-400"}`}>
                        {v.growth >= 0 ? "▲" : "▼"} {Math.abs(v.growth).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={3} className="py-3 pl-0 pr-3 text-xs font-semibold uppercase tracking-widest text-text-muted">Total</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-accent">
                    {formatRpFull(totalRevenue)}
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-text-primary">{totalTransactions}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-text-muted">
                    {formatRpFull(Math.round(totalRevenue / totalTransactions))}
                  </td>
                  <td className="py-3 pl-3 pr-0 text-right">
                    <span className="text-xs font-semibold text-accent">▲ {growthPct}%</span>
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

export default function RevenueReportPage() {
  return (
    <ToastProvider>
      <RevenueContent />
    </ToastProvider>
  );
}
