import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Kanban, LogOut, Sun, Moon, ShieldCheck, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const baseNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/customers', icon: Users, label: 'Customers' },
    { to: '/leads', icon: Target, label: 'Leads' },
    { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
];

interface SidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
    const { theme, toggleTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN';
    const navItems = isAdmin
        ? [...baseNavItems, { to: '/users', icon: ShieldCheck, label: 'Users' }]
        : baseNavItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={`w-60 shrink-0 h-screen flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-[#2A2A2A] transition-transform duration-300 fixed inset-y-0 left-0 z-40 md:static md:z-auto md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                <div>
                    <span className="text-xl font-bold text-[#E50914] tracking-tight">LeadFlow</span>
                    <span className="block text-xs text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-widest">CRM</span>
                </div>
                <button
                    onClick={onClose}
                    className="md:hidden p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* User info */}
            {user && (
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 truncate">{user.role}</p>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
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
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <LogOut size={18} strokeWidth={1.75} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
