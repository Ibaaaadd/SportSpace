"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Align = "left" | "center" | "right";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: Align;
  className?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  striped?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  defaultPageSize?: number;
};

const alignStyles: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

// Fixed skeleton widths to avoid hydration issues
const SKELETON_WIDTHS = ["72%", "55%", "80%", "60%", "68%"];

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function IconRefresh({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 transition-transform duration-700 ${spinning ? "animate-spin" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "Belum ada data.",
  striped = true,
  loading = false,
  onRefresh,
  defaultPageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Reset to page 1 whenever data changes (filter/search applied)
  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const startRow = data.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, data.length);

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-ink-2">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted ${alignStyles[col.align ?? "left"]} ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows
              SKELETON_WIDTHS.map((_, rowIdx) => (
                <tr key={rowIdx} className="border-b border-border/50 last:border-b-0">
                  {columns.map((col, colIdx) => (
                    <td key={String(col.key)} className={`px-4 py-3 ${alignStyles[col.align ?? "left"]}`}>
                      <div
                        className="h-4 animate-pulse rounded-lg bg-ink-2"
                        style={{ width: colIdx === columns.length - 1 ? "48px" : SKELETON_WIDTHS[rowIdx % SKELETON_WIDTHS.length] }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-text-muted">
                  {data.length === 0 ? emptyMessage : "Tidak ada data yang cocok dengan filter."}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-border/50 last:border-b-0 transition-colors hover:bg-ink-2/60 ${
                    striped && rowIndex % 2 === 1 ? "bg-ink-2/20" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm text-text-primary ${alignStyles[col.align ?? "left"]} ${col.className ?? ""}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-ink-2/40 px-4 py-2.5">
        {/* Info */}
        <p className="text-xs text-text-muted">
          {loading ? (
            <span className="animate-pulse">Memuat data...</span>
          ) : data.length === 0 ? (
            "Tidak ada data"
          ) : (
            <>
              Menampilkan <span className="font-medium text-text-primary">{startRow}–{endRow}</span> dari{" "}
              <span className="font-medium text-text-primary">{data.length}</span> data
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
                aria-label="Halaman sebelumnya"
              >
                <IconChevronLeft />
              </button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-text-muted">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    disabled={loading}
                    className={`inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border px-2 text-xs font-medium transition disabled:pointer-events-none ${
                      page === p
                        ? "border-secondary bg-secondary/15 text-secondary"
                        : "border-border text-text-muted hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary disabled:pointer-events-none disabled:opacity-30"
                aria-label="Halaman berikutnya"
              >
                <IconChevronRight />
              </button>
            </div>
          )}

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            disabled={loading}
            className="h-7 appearance-none rounded-lg border border-border bg-ink-2 px-2 pr-6 text-xs text-text-muted outline-none transition hover:border-secondary focus:border-secondary disabled:opacity-40"
            style={{ backgroundImage: "none" }}
            aria-label="Jumlah baris per halaman"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n} style={{ backgroundColor: "var(--surface)" }}>
                {n} / hal
              </option>
            ))}
          </select>

          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-secondary hover:text-secondary disabled:pointer-events-none disabled:opacity-40"
              aria-label="Refresh data"
              title="Refresh data"
            >
              <IconRefresh spinning={loading} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
