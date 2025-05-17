import { useState, useEffect } from 'react';
import { UserProjectsResponse } from '@/types/response';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface UserProjectsData {
    userProjects: UserProjectsResponse | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useUserProjects() {
    const authContext = useAuth();
    const router = useRouter();

    const [data, setData] = useState<UserProjectsData>({
        userProjects: null,
        isLoading: true,
        error: null,
        refetch: () => {},
    });

    useEffect(() => {
        if (!authContext.isLoading && !authContext.isAuthenticated) {
            router.replace('/login');
        }
    }, [authContext.isLoading, authContext.isAuthenticated]);

    useEffect(() => {
        const fetchUserProjects = async () => {
            try {
                const userId = authContext.user?.id;
                if (!userId) {
                    return;
                }
                const response = await apiClient.getProjects(userId);
                setData({
                    userProjects: response,
                    isLoading: false,
                    error: null,
                    refetch: fetchUserProjects,
                });
            } catch (e) {
                setData(prev => ({
                    ...prev,
                    isLoading: false,
                    error: e as Error,
                }));
            }
        };
        fetchUserProjects();
    }, [authContext.user?.id]);
    return data;
}

