import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Kanban, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/leads', icon: Target, label: 'Leads' },
    { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
];

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    return (
        <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-[#2A2A2A]">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                <span className="text-xl font-bold text-[#E50914] tracking-tight">LeadFlow</span>
                <span className="block text-xs text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-widest">CRM</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? 'bg-red-50 dark:bg-[#2A0A0A] text-[#E50914]'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} strokeWidth={1.75} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 dark:border-[#2A2A2A] pt-3">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    {theme === 'light' ? <Moon size={18} strokeWidth={1.75} /> : <Sun size={18} strokeWidth={1.75} />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <LogOut size={18} strokeWidth={1.75} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
