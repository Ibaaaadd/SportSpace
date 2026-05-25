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
  striped = true,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-ink-2">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted ${
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
                className={`border-b border-border/50 last:border-b-0 transition-colors hover:bg-ink-2/60 ${
                  striped && rowIndex % 2 === 1 ? "bg-ink-2/20" : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 text-sm text-text-primary ${
                      alignStyles[column.align ?? "left"]
                    } ${column.className ?? ""}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key as string] ?? "")}
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
