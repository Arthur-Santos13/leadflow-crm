import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={e => {
                if (e.target === overlayRef.current) onClose();
            }}
        >
            <div
                className={`w-full ${sizeClasses[size]} bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-xl border border-gray-200 dark:border-[#2A2A2A] flex flex-col max-h-[90vh]`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A] shrink-0">
                    <h2 id="modal-title" className="text-base font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                        <X size={16} />
                    </Button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-end gap-2 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
