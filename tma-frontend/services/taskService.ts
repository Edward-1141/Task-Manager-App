import { apiClient } from '@/lib/api-client';
import {
    CreateTaskRequest,
    CreateTaskResponse,
    DeleteTaskResponse,
    UpdateTaskRequest,
    UpdateTaskResponse
} from '@/types/response';

export const taskService = {
    async createTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
        const response = await apiClient.createTask(taskData);
        return response;
    },

    async updateTask(updates: UpdateTaskRequest): Promise<UpdateTaskResponse> {
        const response = await apiClient.updateTask(updates);
        return response;
    },

    async deleteTask(taskId: number): Promise<DeleteTaskResponse> {
        const response = await apiClient.deleteTask(taskId);
        return response;
    }
}