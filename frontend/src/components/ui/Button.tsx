import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-[#E50914] hover:bg-[#B20710] text-white border-transparent disabled:opacity-60',
    secondary:
        'bg-white dark:bg-[#1F1F1F] text-gray-700 dark:text-gray-200 border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#2A2A2A]',
    ghost:
        'bg-transparent text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-[#1A1A1A]',
    danger:
        'bg-red-50 dark:bg-[#2A0A0A] text-[#E50914] border-red-200 dark:border-[#5A1A1A] hover:bg-red-100 dark:hover:bg-[#3A0A0A]',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-5 py-2.5 text-sm rounded-xl',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 font-medium border transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {loading && (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
}
