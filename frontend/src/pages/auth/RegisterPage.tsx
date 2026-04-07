import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/ui/ThemeToggle';
import PasswordInput from '../../components/ui/PasswordInput';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            if (msg === 'Email already in use') {
                setError('This email is already registered.');
            } else {
                setError('Could not create account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#E50914] tracking-tight">LeadFlow</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        CRM — Create your account
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2A2A2A] p-8">
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 dark:bg-[#2A0A0A] border border-red-200 dark:border-[#5A1A1A] rounded-xl text-sm text-[#E50914]">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Name
                            </label>
                            <input
                                type="text"
                                required
                                minLength={2}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#141414] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <PasswordInput
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <PasswordInput
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#E50914] hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
