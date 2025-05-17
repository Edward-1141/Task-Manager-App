'use client'

import { createContext, useContext, ReactNode } from 'react';
import { UserProjectsResponse } from '@/types/response';
import { useUserProjects as useUserProjectsHook } from '@/hooks/useUserProjects';

interface UserProjectsContextType {
    userProjects: UserProjectsResponse | null;
    isLoading: boolean;
    refetch: () => void;
}
// Null if not in context provider
// isLoading if context are loading in context provider
const UserProjectsContext = createContext<UserProjectsContextType | null>(null);

interface UserProjectsProviderProps {
    children: ReactNode;
}

export function UserProjectsProvider({ children }: UserProjectsProviderProps) {
    const { userProjects, isLoading, refetch } = useUserProjectsHook();
    return (
        <UserProjectsContext.Provider value={{ userProjects, isLoading, refetch }}>
            {children}
        </UserProjectsContext.Provider>
    );
}

export function useUserProjects() {
    const context = useContext(UserProjectsContext);
    if (context === null) {
        throw new Error('useUserProjects must be used within a UserProjectsProvider');
    }
    return context;
}

