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
};

const alignStyles: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "Belum ada data.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface/70">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-ink-2 text-xs uppercase tracking-[0.2em] text-text-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`border-b border-border px-4 py-3 font-semibold ${
                  alignStyles[column.align ?? "left"]
                } ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-border/60 last:border-b-0"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 text-text-primary ${
                      alignStyles[column.align ?? "left"]
                    } ${column.className ?? ""}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
