import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        api.get<{ data: User }>('/users/me')
            .then(res => setUser(res.data.data))
            .catch(() => logout())
            .finally(() => setIsLoading(false));
    }, [logout]);

    const login = async (email: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>('/auth/login', {
            email,
            password,
        });
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await api.post<{ token: string; user: User }>('/auth/register', {
            name,
            email,
            password,
        });
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
