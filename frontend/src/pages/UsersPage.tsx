import { useEffect, useState } from 'react';
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
            showToast('Role updated successfully.');
        } catch {
            showToast('Failed to update role.');
        } finally {
            setUpdating(null);
        }
    };

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
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-400">No users found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-[#2A2A2A]">
                                <th className="px-5 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">User</th>
                                <th className="px-5 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Email</th>
                                <th className="px-5 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Current role</th>
                                <th className="px-5 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Change role</th>
                                <th className="px-5 py-3.5 text-left font-medium text-gray-500 dark:text-gray-400">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                            {users.map(u => {
                                const isSelf = u.id === me?.id;
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#E50914] flex items-center justify-center text-white font-semibold shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                                                    {isSelf && (
                                                        <p className="text-xs text-gray-400">You</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{u.email}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                                                {ROLE_LABELS[u.role]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {isSelf ? (
                                                <span className="text-xs text-gray-400 italic">Cannot change own role</span>
                                            ) : updating === u.id ? (
                                                <span className="text-xs text-gray-400">Saving...</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    onChange={e => handleRoleChange(u.id, e.target.value as UserRole)}
                                                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                                                >
                                                    <option value="AGENT">Agent</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                                            {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
