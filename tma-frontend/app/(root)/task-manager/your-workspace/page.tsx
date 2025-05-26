'use client'

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import ProjectCard from "@/components/ProjectCard";
import LoadingCard from "@/components/LoadingCard";
import NewProjectModal from "@/components/NewProjectModal";
import { useUserProjects } from "@/contexts/UserProjectsContext";
import { projectService } from '@/services/projectService';
import { CreateProjectRequest } from '@/types/response';

export default function Page() {
    const { userProjects, isLoading, refetch } = useUserProjects();
    const [showNewProjectModal, setShowNewProjectModal] = useState(false);
    const router = useRouter();
    const handleCreateProject = async (projectData: CreateProjectRequest) => {
        try {
            const project = await projectService.createProject(projectData);
            setShowNewProjectModal(false);
            router.push(`/task-manager/projects/${project.id}`);
            refetch();
        } catch (error) {
            setShowNewProjectModal(false);
            console.error('Error creating project:', error);
            toast.error('Error creating project:' + (error as Error).message || 'Unknown error');
        }
    };

    var body;

    if (isLoading) {
        body = 
            <div className="flex flex-wrap gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <LoadingCard key={index} />
                ))}
            </div>;
    } else if (userProjects === null || userProjects.projects.length === 0) {
        body = (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Projects Found</h3>
                <p className="text-gray-500 text-center max-w-md">
                    Get started by creating your first project. Click the button below to create a new project.
                </p>
                <button 
                    onClick={() => setShowNewProjectModal(true)}
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    Create New Project
                </button>
            </div>
        );
    } else {
        // align the cards to the left
        body = (
            <div className="flex flex-wrap gap-4 max-w-[2000px]">
                {userProjects.projects.map((project) => (
                    <div key={project.id}>
                        <ProjectCard project={project} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Your Workspace</h1>
                    <p className="mt-2 text-lg text-gray-600">Manage and organize your projects</p>
                </div>
                <button 
                    onClick={() => setShowNewProjectModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">New Project</span>
                    <span className="sm:hidden"></span>
                </button>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Projects</h2>
            {body}

            {showNewProjectModal && (
                <NewProjectModal
                    onClose={() => setShowNewProjectModal(false)}
                    onSubmit={handleCreateProject}
                />
            )}
        </>
    )
}