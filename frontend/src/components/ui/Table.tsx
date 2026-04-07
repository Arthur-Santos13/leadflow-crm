interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T extends { id: string }> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
}

export default function Table<T extends { id: string }>({
    columns,
    data,
    loading = false,
    emptyMessage = 'No records found.',
}: TableProps<T>) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1F1F1F]">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-[#2A2A2A]">
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.className ?? ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-10 text-center">
                                <div className="flex justify-center">
                                    <span className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-10 text-center text-gray-400 dark:text-gray-600"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr
                                key={row.id}
                                className={`border-b border-gray-50 dark:border-[#2A2A2A] last:border-0 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-[#1A1A1A]/50' : ''
                                    }`}
                            >
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.className ?? ''}`}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : String((row as Record<string, unknown>)[col.key] ?? '—')}
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
