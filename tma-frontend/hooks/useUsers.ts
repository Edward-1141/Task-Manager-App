'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/response';
import { userService } from '@/services/userService';

// TODO: get users from backend when searching instead of directly fetching all users if we have a large scale project
// but for now, this is fine

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch users'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, isLoading, error };
} 