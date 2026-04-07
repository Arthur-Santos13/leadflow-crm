import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/customers': 'Customers',
    '/leads': 'Leads',
    '/pipeline': 'Pipeline',
    '/users': 'Users',
};

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const title = pageTitles[pathname] ?? 'LeadFlow CRM';

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-[#2A2A2A] sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                    aria-label="Toggle menu"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center text-white text-sm font-semibold select-none">
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
            </div>
        </header>
    );
}
