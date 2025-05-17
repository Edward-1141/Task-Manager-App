import { apiClient } from '@/lib/api-client';
import { User, CreateUserRequest, CreateUserResponse } from '@/types/response';

export const userService = {
    async getUsers(): Promise<User[]> {
        const response = await apiClient.getUsers();
        return response.users;
    },

    async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
        const response = await apiClient.createUser(userData);
        return response;
    }
}; 