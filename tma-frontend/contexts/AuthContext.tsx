'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types/response'
import Cookies from 'js-cookie';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = Cookies.get('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);
            setToken(response.token);
            setUser(response.user);
            // Store token in cookie with 7 days expiry
            Cookies.set('token', response.token, { expires: 7 });
            localStorage.setItem('user', JSON.stringify(response.user));
            router.push('/');
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}