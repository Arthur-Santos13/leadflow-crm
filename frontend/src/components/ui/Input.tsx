import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent transition-shadow ${error
                            ? 'border-[#E50914]'
                            : 'border-gray-200 dark:border-[#333]'
                        } ${className}`}
                    {...props}
                />
                {error && <p className="text-xs text-[#E50914]">{error}</p>}
                {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-600">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
