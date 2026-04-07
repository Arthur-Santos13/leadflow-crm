import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import ThemeToggle from '../../components/ui/ThemeToggle';
import PasswordInput from '../../components/ui/PasswordInput';

type Step = 'email' | 'reset' | 'done';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
                setStep('reset');
            } else {
                // production: no token returned — show generic message
                setStep('done');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
            setStep('done');
        } catch {
            setError('Failed to reset password. Please start over.');
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
                        CRM — Password recovery
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-sm border border-gray-200 dark:border-[#2A2A2A] p-8">

                    {/* Step: done */}
                    {step === 'done' && (
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-[#0A2A0A]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Password updated!</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Your password has been reset successfully.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-2.5 px-4 bg-[#E50914] hover:bg-[#B20710] text-white font-semibold rounded-xl transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    )}

                    {/* Step: enter email */}
                    {step === 'email' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forgot your password?</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Enter your email to start the reset process.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-5 p-3 bg-red-50 dark:bg-[#2A0A0A] border border-red-200 dark:border-[#5A1A1A] rounded-xl text-sm text-[#E50914]">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {loading ? 'Checking...' : 'Continue'}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                Remembered your password?{' '}
                                <Link to="/login" className="text-[#E50914] hover:underline font-medium">Sign in</Link>
                            </p>
                        </>
                    )}

                    {/* Step: set new password */}
                    {step === 'reset' && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Set new password</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Choose a new password for <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-5 p-3 bg-red-50 dark:bg-[#2A0A0A] border border-red-200 dark:border-[#5A1A1A] rounded-xl text-sm text-[#E50914]">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleResetSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        New password
                                    </label>
                                    <PasswordInput
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="At least 8 characters"
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Confirm new password
                                    </label>
                                    <PasswordInput
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {loading ? 'Saving...' : 'Reset password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
