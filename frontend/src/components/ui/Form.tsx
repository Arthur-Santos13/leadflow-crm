import { forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ── FormField wrapper ─────────────────────────────────────────────────────────
interface FormFieldProps {
    label?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function FormField({ label, error, hint, required, children }: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="ml-0.5 text-[#E50914]">*</span>}
                </span>
            )}
            {children}
            {error && <p className="text-xs text-[#E50914]">{error}</p>}
            {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-600">{hint}</p>}
        </div>
    );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => (
        <FormField label={label} error={error}>
            <select
                ref={ref}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#141414] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-shadow ${error ? 'border-[#E50914]' : 'border-gray-200 dark:border-[#333]'
                    } ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map(o => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </FormField>
    )
);
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', rows = 3, ...props }, ref) => (
        <FormField label={label} error={error}>
            <textarea
                ref={ref}
                rows={rows}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-shadow resize-none ${error ? 'border-[#E50914]' : 'border-gray-200 dark:border-[#333]'
                    } ${className}`}
                {...props}
            />
        </FormField>
    )
);
Textarea.displayName = 'Textarea';

// ── Pagination ────────────────────────────────────────────────────────────────
interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-end gap-2 mt-4">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
                {page} / {totalPages}
            </span>
            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
        </div>
    );
}
