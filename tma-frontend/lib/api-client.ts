import { z } from 'zod';
import * as responseTypes from '@/types/response';
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
    status?: number;
    code?: string;
    details?: unknown;

    constructor(message: string, status?: number, code?: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export class NetworkError extends ApiError {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, details: unknown) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

class ApiClient {
    private async fetch<T>(endpoint: string, schema: z.ZodSchema<T>, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const token = Cookies.get('token');

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });

            // TODO: if it is unauthenticated/expired token error, redirect to login
            if (response.status === 401) {
                window.location.href = '/login';
                throw new ApiError('Unauthorized', response.status, 'UNAUTHORIZED');
            }

            if (!response.ok) {
                let errorMessage = 'API request failed';
                let errorDetails: unknown;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    errorDetails = errorData;
                } catch {
                    // If we can't parse the error response, use the status text
                    errorMessage = response.statusText || errorMessage;
                }

                throw new ApiError(errorMessage, response.status, undefined, errorDetails);
            }

            const data = await response.json();

            // Parse the response and throw an error if it's invalid
            try {
                return schema.parse(data);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.log("Error to parse response", data);
                    throw new ValidationError('Response validation failed', error.errors);
                }
                throw error;
            }
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new NetworkError('An unexpected error occurred');
        }
    }

    // Auth endpoints
    async login(email: string, password: string): Promise<responseTypes.LoginResponse> {
        return this.fetch<responseTypes.LoginResponse>(
            '/api/auth/login',
            responseTypes.LoginResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }
        );
    }

    // Create project
    async createProject(projectData: responseTypes.CreateProjectRequest): Promise<responseTypes.CreateProjectResponse> {
        return this.fetch<responseTypes.CreateProjectResponse>(
            '/api/projects',
            responseTypes.CreateProjectResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify(projectData),
            }
        );
    }

    // Create status
    async createStatus(statusData: responseTypes.CreateStatusRequest): Promise<responseTypes.CreateStatusResponse> {
        return this.fetch<responseTypes.CreateStatusResponse>(
            `/api/projects/status?pId=${statusData.project_id}`,
            responseTypes.CreateStatusResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify(statusData),
            }
        );
    }

    // Update status
    async updateStatus(updates: responseTypes.UpdateStatusRequest): Promise<responseTypes.UpdateStatusResponse> {
        return this.fetch<responseTypes.UpdateStatusResponse>(
            `/api/projects/status?sId=${updates.id}`,
            responseTypes.UpdateStatusResponseSchema,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        );
    }

    // Delete status
    async deleteStatus(statusId: number): Promise<responseTypes.DeleteStatusResponse> {
        return this.fetch<responseTypes.DeleteStatusResponse>(
            `/api/projects/status/?sId=${statusId}`,
            responseTypes.DeleteStatusResponseSchema,
            {
                method: 'DELETE',
            }
        );
    }

    // Create tag
    async createTag(tagData: responseTypes.CreateTagRequest): Promise<responseTypes.CreateTagResponse> {
        return this.fetch<responseTypes.CreateTagResponse>(
            `/api/projects/tag?pId=${tagData.project_id}`,
            responseTypes.CreateTagResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify(tagData),
            }
        );
    }

    // Update tag
    async updateTag(updates: responseTypes.UpdateTagRequest): Promise<responseTypes.UpdateTagResponse> {
        return this.fetch<responseTypes.UpdateTagResponse>(
            `/api/projects/tag?tId=${updates.id}`,
            responseTypes.UpdateTagResponseSchema,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        );
    }

    // Delete tag
    async deleteTag(tagId: number): Promise<responseTypes.DeleteTagResponse> {
        return this.fetch<responseTypes.DeleteTagResponse>(
            `/api/projects/tag/?tId=${tagId}`,
            responseTypes.DeleteTagResponseSchema,
            {
                method: 'DELETE',
            }
        );
    }

    // Update project
    async updateProject(updates: responseTypes.UpdateProjectRequest): Promise<responseTypes.UpdateProjectResponse> {
        return this.fetch<responseTypes.UpdateProjectResponse>(
            `/api/projects?pId=${updates.id}`,
            responseTypes.UpdateProjectResponseSchema,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        );
    }

    // Delete project
    async deleteProject(projectId: number): Promise<responseTypes.DeleteProjectResponse> {
        return this.fetch<responseTypes.DeleteProjectResponse>(
            `/api/projects/?pId=${projectId}`,
            responseTypes.DeleteProjectResponseSchema,
            {
                method: 'DELETE',
            }
        );
    }

    // Get projects for a user to display in the workspace
    async getProjects(userId: number): Promise<responseTypes.UserProjectsResponse> {
        return this.fetch<responseTypes.UserProjectsResponse>(
            `/api/projects/users/?uId=${userId}`, // TODO: remove this
            responseTypes.UserProjectsResponseSchema,
            {
                method: 'GET',
            }
        );
    }

    // Get project details for a project to display in the project page
    async getProjectDetails(projectId: number): Promise<responseTypes.ProjectDetailsResponse> {
        return this.fetch(`/api/projects/details?pId=${projectId}`,
            responseTypes.ProjectDetailsResponseSchema,
            {
                method: 'GET',
            }
        );
    }

    // Create task
    async createTask(taskData: responseTypes.CreateTaskRequest): Promise<responseTypes.CreateTaskResponse> {
        return this.fetch<responseTypes.CreateTaskResponse>(
            `/api/tasks?pId=${taskData.project_id}`,
            responseTypes.CreateTaskResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify(taskData),
            }
        );
    }

    // Update task
    async updateTask(updates: responseTypes.UpdateTaskRequest): Promise<responseTypes.UpdateTaskResponse> {
        return this.fetch<responseTypes.UpdateTaskResponse>(
            `/api/tasks?tId=${updates.id}`,
            responseTypes.UpdateTaskResponseSchema,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        );
    }

    // Delete task
    async deleteTask(taskId: number): Promise<responseTypes.DeleteTaskResponse> {
        return this.fetch<responseTypes.DeleteTaskResponse>(
            `/api/tasks/?tId=${taskId}`,
            responseTypes.DeleteTaskResponseSchema,
            {
                method: 'DELETE',
            }
        );
    }

    // TODO: add endpoints getting single task for better reloading performance inside a project page

    // Get all users
    async getUsers(): Promise<responseTypes.UsersResponse> {
        return this.fetch('/api/users', responseTypes.UsersResponseSchema,
            {
                method: 'GET',
            }
        );
    }

    // Create a new user
    async createUser(userData: responseTypes.CreateUserRequest): Promise<responseTypes.CreateUserResponse> {
        return this.fetch('/api/auth/register', responseTypes.CreateUserResponseSchema,
            {
                method: 'POST',
                body: JSON.stringify(userData),
            }
        );
    }
}

export const apiClient = new ApiClient(); 