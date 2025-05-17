import { apiClient } from '@/lib/api-client';
import {
    ProjectDetails,
    CreateProjectRequest,
    UpdateProjectRequest,
    UpdateProjectResponse, 
    DeleteProjectResponse, 
    CreateProjectResponse,
    UpdateStatusResponse,
    UpdateStatusRequest,
    CreateStatusResponse,
    CreateStatusRequest,
    DeleteStatusResponse,
    CreateTagResponse,
    CreateTagRequest,
    UpdateTagResponse,
    UpdateTagRequest,
    DeleteTagResponse
} from '@/types/response';

export const projectService = {
    async createProject(projectData: CreateProjectRequest): Promise<CreateProjectResponse> {
        const response = await apiClient.createProject(projectData);
        return response;
    },

    async getProjectDetails(projectId: number): Promise<ProjectDetails> {
        const response = await apiClient.getProjectDetails(projectId);
        console.log("fetching project details", response);

        const tagMap = Object.fromEntries(Object.entries(response.tag_map).map(([key, value]) => {
            return [parseInt(key), {
                ...value,
                id: parseInt(key),
            }];
        }));

        const statusMap = Object.fromEntries(Object.entries(response.status_map).map(([key, value]) => {
            return [parseInt(key), {
                ...value,
                id: parseInt(key),
            }];
        }));

        const projectDetails: ProjectDetails = {
            ...response,
            tag_map: tagMap,
            status_map: statusMap,
        }

        return projectDetails;
    },

    async updateProject(updates: UpdateProjectRequest): Promise<UpdateProjectResponse> {
        const response = await apiClient.updateProject(updates);
        return response;
    },

    async deleteProject(projectId: number): Promise<DeleteProjectResponse> {
        const response = await apiClient.deleteProject(projectId);
        return response;
    },

    async createStatus(statusData: CreateStatusRequest): Promise<CreateStatusResponse> {
        const response = await apiClient.createStatus(statusData);
        return response;
    },

    async updateStatus(updates: UpdateStatusRequest): Promise<UpdateStatusResponse> {
        const response = await apiClient.updateStatus(updates);
        return response;
    },

    async deleteStatus(statusId: number): Promise<DeleteStatusResponse> {
        const response = await apiClient.deleteStatus(statusId);
        return response;
    },

    async createTag(tagData: CreateTagRequest): Promise<CreateTagResponse> {
        const response = await apiClient.createTag(tagData);
        return response;
    },

    async updateTag(updates: UpdateTagRequest): Promise<UpdateTagResponse> {
        const response = await apiClient.updateTag(updates);
        return response;
    },

    async deleteTag(tagId: number): Promise<DeleteTagResponse> {
        const response = await apiClient.deleteTag(tagId);
        return response;
    },

}; 