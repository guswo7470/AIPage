"use client";

import { useLanguage } from "@/lib/language-context";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  totalCount,
  page,
  limit,
  onPageChange,
  loading,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useLanguage();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalCount);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-zinc-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-400 dark:text-zinc-500"
                >
                  {t("admin.common.loading")}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-400 dark:text-zinc-500"
                >
                  {t("admin.common.no_data")}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-100 dark:border-zinc-800/50 ${
                    onRowClick
                      ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                      : ""
                  } transition-colors`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-3 px-4 text-gray-700 dark:text-zinc-300"
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-500 dark:text-zinc-400">
          <span>
            {t("admin.common.showing")} {start}-{end} {t("admin.common.of")} {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {t("admin.common.prev")}
            </button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {t("admin.common.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
