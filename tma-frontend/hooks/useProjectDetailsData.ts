import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
    CreateStatusRequest,
    CreateTagRequest,
    ProjectDetails,
    UpdateProjectRequest,
    UpdateStatusRequest,
    UpdateTagRequest,
    UpdateTaskRequest
} from '@/types/response';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';

// TODO: refactor the structure that put the functions in another file

export interface ProjectDetailsData {
    projectDetails: ProjectDetails | null;
    isLoading: boolean;
    error: Error | null;
    updateTask: (updates: UpdateTaskRequest) => Promise<void>;
    updateProject: (updates: UpdateProjectRequest) => Promise<void>;
    status: {
        create: (statusData: CreateStatusRequest) => Promise<void>;
        update: (updates: UpdateStatusRequest) => Promise<void>;
        delete: (statusId: number) => Promise<void>;
    };
    tag: {
        create: (tagData: CreateTagRequest) => Promise<void>;
        update: (updates: UpdateTagRequest) => Promise<void>;
        delete: (tagId: number) => Promise<void>;
    };
}

async function updateTask(updates: UpdateTaskRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    // Store the previous state for potential rollback
    let previousState: ProjectDetailsData | null = null;
    
    // Optimistically update the local state first
    requestAnimationFrame(() => {
        setData(prev => {
            // Save the previous state
            previousState = prev;
            
            if (!prev.projectDetails) return prev;

            const updatedTasks = prev.projectDetails.tasks.map(task =>
                task.id === updates.id
                    ? { ...task, ...updates }
                    : task
            );

            return {
                ...prev,
                projectDetails: {
                    ...prev.projectDetails,
                    tasks: updatedTasks
                }
            };
        });
    });

    try {
        await taskService.updateTask(updates);
    } catch (error) {
        console.error('Failed to update task:', error);
        
        // Roll back to previous state if API call fails
        if (previousState) {
            setData(previousState);
        }
        
        // TODO: Show error notification to user or error handle UI
    }
}

async function updateProject(updates: UpdateProjectRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;

            return {
                ...prev,
                projectDetails: { ...prev.projectDetails, ...updates }
            };
        });
    });

    try {
        await projectService.updateProject(updates);
    } catch (error) {
        console.error('Failed to update project:', error);
        if (previousState) setData(previousState);
        // TODO: Show error notification
    }
}

async function createStatus(statusData: CreateStatusRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    let tempId: number;
    
    // Optimistic update with temporary ID
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;

            tempId = Math.max(...Object.keys(prev.projectDetails.status_map).map(Number)) + 1;

            return {
                ...prev,
                projectDetails: {
                    ...prev.projectDetails,
                    status_map: {
                        ...prev.projectDetails.status_map,
                        [tempId]: {
                            ...statusData,
                            id: tempId,
                        }
                    }
                }
            };
        });
    });

    try {
        const response = await projectService.createStatus(statusData);
        
        // Update with real ID
        setData(prev => {
            if (!prev.projectDetails) return prev;

            const { [tempId]: _, ...restStatusMap } = prev.projectDetails.status_map;
            
            return {
                ...prev,
                projectDetails: {
                    ...prev.projectDetails,
                    status_map: {
                        ...restStatusMap,
                        [response.id]: {
                            ...statusData,
                            id: response.id,
                        }
                    }
                }
            };
        });
    } catch (error) {
        console.error('Failed to create status:', error);
        if (previousState) setData(previousState);
    }
}

async function updateStatus(updates: UpdateStatusRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;

            return {
                ...prev,
                projectDetails: {
                    ...prev.projectDetails,
                    status_map: {
                        ...prev.projectDetails.status_map,
                        [updates.id]: {
                            ...prev.projectDetails.status_map[updates.id],
                            ...updates
                        }
                    }
                }
            };
        });
    });

    try {
        await projectService.updateStatus(updates);
    } catch (error) {
        console.error('Failed to update status:', error);
        if (previousState) setData(previousState);
    }
}

async function deleteStatus(statusId: number, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    let deletedStatus: any = null;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;
            
        deletedStatus = prev.projectDetails.status_map[statusId];
        
        return {
            ...prev,
            projectDetails: {
                ...prev.projectDetails,
                status_map: Object.fromEntries(
                    Object.entries(prev.projectDetails.status_map).filter(([key]) => key !== statusId.toString())
                )
            }
        };
        });
    });

    try {
        await projectService.deleteStatus(statusId);
    } catch (error) {
        console.error('Failed to delete status:', error);
        if (previousState) setData(previousState);
    }
}

async function createTag(tagData: CreateTagRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    let tempId: number;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;

            tempId = Math.max(...Object.keys(prev.projectDetails.tag_map).map(Number)) + 1;

        return {
            ...prev,
            projectDetails: {
                ...prev.projectDetails,
                tag_map: {
                    ...prev.projectDetails.tag_map,
                    [tempId]: {
                        ...tagData,
                        id: tempId,
                    }
                }
            }
        };
        });
    });

    try {
        const response = await projectService.createTag(tagData);

        // Update with real ID
        setData(prev => {
            if (!prev.projectDetails) return prev;

            const { [tempId]: _, ...restTagMap } = prev.projectDetails.tag_map;

            return {
                ...prev,
                projectDetails: {
                    ...prev.projectDetails,
                    tag_map: {
                        ...restTagMap,
                        [response.id]: {
                            ...tagData,
                            id: response.id,
                        }
                    }
                }
            };
        });
    } catch (error) {
        console.error('Failed to create tag:', error);
        if (previousState) setData(previousState);
    }
}

async function updateTag(updates: UpdateTagRequest, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;

        return {
            ...prev,
            projectDetails: {
                ...prev.projectDetails,
                tag_map: {
                    ...prev.projectDetails.tag_map,
                    [updates.id]: {
                        ...prev.projectDetails.tag_map[updates.id],
                        ...updates
                    }
                }
            }
        };
        });
    });

    try {
        await projectService.updateTag(updates);
    } catch (error) {
        console.error('Failed to update tag:', error);
        if (previousState) setData(previousState);
    }
}

async function deleteTag(tagId: number, setData: Dispatch<SetStateAction<ProjectDetailsData>>) {
    let previousState: ProjectDetailsData | null = null;
    let deletedTag: any = null;
    
    // Optimistic update
    requestAnimationFrame(() => {
        setData(prev => {
            previousState = prev;
            if (!prev.projectDetails) return prev;
        
        deletedTag = prev.projectDetails.tag_map[tagId];
        
        return {
            ...prev,
            projectDetails: {
                ...prev.projectDetails,
                tag_map: Object.fromEntries(
                    Object.entries(prev.projectDetails.tag_map).filter(([key]) => key !== tagId.toString())
                )
            }
        };
        });
    });

    try {
        await projectService.deleteTag(tagId);
    } catch (error) {
        console.error('Failed to delete tag:', error);
        if (previousState) setData(previousState);
    }
}

export function useProjectDetailsData(projectId: number | null) {
    const [data, setData] = useState<ProjectDetailsData>({
        projectDetails: null,
        isLoading: true,
        error: null,
        updateTask: async () => { },
        updateProject: async () => { },
        status: {
            create: async () => { },
            update: async () => { },
            delete: async () => { }
        },
        tag: {
            create: async () => { },
            update: async () => { },
            delete: async () => { }
        }
    });

    useEffect(() => {
        if (projectId === null) {
            return;
        }
        const fetchProjectTasks = async () => {
            try {
                const response = await projectService.getProjectDetails(projectId);
                setData({
                    projectDetails: response,
                    isLoading: false,
                    error: null,
                    updateTask: async (updates: UpdateTaskRequest) => {
                        await updateTask(updates, setData);
                    },
                    updateProject: async (updates: UpdateProjectRequest) => {
                        await updateProject(updates, setData);
                    },
                    status: {
                        create: async (statusData: CreateStatusRequest) => {
                            await createStatus(statusData, setData);
                        },
                        update: async (updates: UpdateStatusRequest) => {
                            await updateStatus(updates, setData);
                        },
                        delete: async (statusId: number) => {
                            await deleteStatus(statusId, setData);
                        }
                    },
                    tag: {
                        create: async (tagData: CreateTagRequest) => {
                            await createTag(tagData, setData);
                        },
                        update: async (updates: UpdateTagRequest) => {
                            await updateTag(updates, setData);
                        },
                        delete: async (tagId: number) => {
                            await deleteTag(tagId, setData);
                        }
                    }
                });
            } catch (e) {
                setData(prev => ({
                    ...prev,
                    isLoading: false,
                    error: e as Error
                }));
            }
        };
        fetchProjectTasks();
    }, [projectId]);
    return data;
}

