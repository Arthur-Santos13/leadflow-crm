import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listUsers, updateUserRole } from '../services/users.service';
import type { AppUser, UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
    ADMIN: 'Admin',
    AGENT: 'Agent',
};

const ROLE_BADGE: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 dark:bg-[#2A0A0A] text-[#E50914]',
    AGENT: 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400',
};

export default function UsersPage() {
    const { user: me } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        listUsers()
            .then(setUsers)
            .catch(() => setError('Failed to load users.'))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdating(userId);
        try {
            const updated = await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setExpandedId(null);
            showToast('Role updated successfully.');
        } catch {
            showToast('Failed to update role.');
        } finally {
            setUpdating(null);
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (a.id === me?.id) return -1;
        if (b.id === me?.id) return 1;
        return 0;
    });

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-[#1F1F1F] dark:bg-white text-white dark:text-gray-900 text-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#2A2A2A] dark:border-gray-200 transition-all">
                    {toast}
                </div>
            )}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage team members and their roles.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-[#2A0A0A] border border-red-200 dark:border-[#5A1A1A] rounded-xl text-sm text-[#E50914]">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
                ) : sortedUsers.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400">No users found.</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                        {sortedUsers.map(u => {
                            const isSelf = u.id === me?.id;
                            const isExpanded = expandedId === u.id;
                            return (
                                <li key={u.id}>
                                    {/* Row */}
                                    <div
                                        className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${!isSelf ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525]' : ''}`}
                                        onClick={() => {
                                            if (!isSelf) setExpandedId(prev => prev === u.id ? null : u.id);
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div className="w-9 h-9 rounded-full bg-[#E50914] flex items-center justify-center text-white font-semibold shrink-0">
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                                                {isSelf && (
                                                    <span className="text-xs text-gray-400">(You)</span>
                                                )}
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                                                    {ROLE_LABELS[u.role]}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{u.email}</p>
                                        </div>

                                        {/* Chevron */}
                                        {!isSelf && (
                                            <div className="shrink-0 text-gray-400">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded role selector */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-1 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-[#2A2A2A]">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5">Change role for <span className="font-medium text-gray-700 dark:text-gray-300">{u.name}</span>:</p>
                                            {updating === u.id ? (
                                                <span className="text-xs text-gray-400">Saving...</span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {(['ADMIN', 'AGENT'] as UserRole[]).map(role => (
                                                        <button
                                                            key={role}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                if (u.role !== role) handleRoleChange(u.id, role);
                                                            }}
                                                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${u.role === role
                                                                    ? 'bg-[#E50914] text-white cursor-default'
                                                                    : 'bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:border-[#E50914] hover:text-[#E50914]'
                                                                }`}
                                                        >
                                                            {ROLE_LABELS[role]}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
