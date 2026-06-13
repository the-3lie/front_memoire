import { useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  actions?: (item: T) => ReactNode;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = 'Rechercher...',
  searchKeys = [],
  actions,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = searchKeys.length > 0
    ? data.filter((item) =>
        searchKeys.some((key) =>
          String(item[key] ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200 dark:border-dark-700">
              {columns.map((col) => (
                <th key={col.key} className="text-left py-3 px-4 text-sm font-semibold text-dark-500 dark:text-dark-400">
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="text-right py-3 px-4 text-sm font-semibold text-dark-500 dark:text-dark-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.map((item, i) => (
              <tr key={i} className="table-row">
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-sm text-dark-700 dark:text-dark-300">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="py-3 px-4 text-right">{actions(item)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-100 dark:border-dark-700">
          <span className="text-sm text-dark-500 dark:text-dark-400">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
