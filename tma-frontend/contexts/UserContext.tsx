'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/response';

interface UserContextType {
    users: User[];
    isLoading: boolean;
    error: Error | null;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const { users, isLoading, error } = useUsers();
    
    return (
        <UserContext.Provider value={{ users, isLoading, error }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
}
