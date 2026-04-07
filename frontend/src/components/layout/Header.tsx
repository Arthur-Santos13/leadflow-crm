import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/customers': 'Customers',
    '/leads': 'Leads',
    '/pipeline': 'Pipeline',
    '/users': 'Users',
};

export default function Header() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const title = pageTitles[pathname] ?? 'LeadFlow CRM';

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-[#2A2A2A] sticky top-0 z-10">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center text-white text-sm font-semibold select-none">
                    {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
            </div>
        </header>
    );
}
