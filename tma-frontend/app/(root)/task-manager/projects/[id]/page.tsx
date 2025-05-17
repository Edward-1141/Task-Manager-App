'use client'

import TaskCard from "@/components/TaskCard";
import LoadingCard from "@/components/LoadingCard";
import ProjectViewBar from "@/components/ProjectViewBar";
import NewTaskModal from "@/components/NewTaskModal";
import ProjectManagementOverlay from "@/components/ProjectManagementOverlay";
import { useProjectDetails } from "@/contexts/ProjectDetailsContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";
import { toast } from "react-toastify";
import { CreateTaskRequest } from "@/types/response";
import { useUserProjects } from "@/contexts/UserProjectsContext";
type ViewType = 'overview' | 'timeline' | 'tags' | 'status';


export default function ProjectPage() {
    const router = useRouter();
    const { refetch: refetchUserProjects } = useUserProjects();
    const [currentView, setCurrentView] = useState<ViewType>('overview');
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showProjectManagement, setShowProjectManagement] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { projectId, projectDetailsData, isLoading, error, refreshProjectDetails } = useProjectDetails();


    const handleCreateTask = async (taskData: CreateTaskRequest) => {
        try {
            await taskService.createTask(taskData);
            setShowNewTaskModal(false);
            refreshProjectDetails();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Error creating task:' + (error as Error).message || 'Unknown error');
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(true);
            await projectService.deleteProject(projectId!);
            console.log('Project deleted successfully', projectId);
            toast.success('Project deleted successfully');
            refetchUserProjects();
            router.push('/task-manager/your-workspace');
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Error deleting project:' + (error as Error).message || 'Unknown error');
        } finally {
            setIsDeleting(false);
        }
    };



    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <LoadingCard key={index} />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error.message}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="pb-2 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{projectDetailsData.projectDetails!.project.name}</h1>
                    <p className="mt-2 text-lg text-gray-600">{projectDetailsData.projectDetails!.tasks.length} tasks in total</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowProjectManagement(true)}
                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage Project
                    </button>
                    <button
                        onClick={() => handleDeleteProject()}
                        disabled={isDeleting}
                        className="bg-red-500 block w-40 text-center px-6 py-3 text-base font-medium text-white hover:bg-red-400 mx-auto my-1 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </button>
                    <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Task
                    </button>
                </div>
            </div>

            <ProjectViewBar
                currentView={currentView}
                onViewChange={setCurrentView}
            />

            {projectDetailsData.projectDetails!.tasks.length === 0 && (
                <div className="p-6">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">No project tasks found</span>
                    </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 mt-6">
                {projectDetailsData.projectDetails!.tasks.sort((a, b) => a.name.localeCompare(b.name)).map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                    />
                ))}
            </div>

            {showNewTaskModal && (
                <NewTaskModal
                    onClose={() => setShowNewTaskModal(false)}
                    onSubmit={handleCreateTask}
                />
            )}

            {showProjectManagement && (
                <ProjectManagementOverlay
                    onClose={() => {
                        setShowProjectManagement(false);
                    }}
                />
            )}
        </div>
    );
}