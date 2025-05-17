'use client'

import { createContext, useContext, ReactNode, SetStateAction } from 'react';
import { ProjectDetailsData } from '@/hooks/useProjectDetailsData';
import { useProjectDetailsData } from '@/hooks/useProjectDetailsData';
import { useUserContext } from '@/contexts/UserContext';
import { User } from '@/types/response';

interface ProjectDetailsContextType {
    projectId: number | null;
    isLoading: boolean;
    error: Error | null;
    projectDetailsData: ProjectDetailsData;
    userMap: Record<number, User>;
    refreshProjectDetails: () => void;
}

const ProjectDetailsContext = createContext<ProjectDetailsContextType | undefined>(undefined);

interface ProjectDetailsProviderProps {
    children: ReactNode;
    projectId: number | null;
    setProjectId: (value: SetStateAction<number | null>)  => void;
}

// TODO: useProjectDetailsData should be in the context provider
export function ProjectDetailsProvider({ children, projectId, setProjectId }: ProjectDetailsProviderProps) {
    const projectDetailsData = useProjectDetailsData(projectId);
    const userContext = useUserContext();

    
    return (
        <ProjectDetailsContext.Provider value={{ 
            projectId,
            isLoading: projectDetailsData.isLoading || userContext.isLoading || projectId === null,
            error: projectDetailsData.error || userContext.error,
            projectDetailsData,
            userMap: Object.fromEntries(userContext.users.map(user => [user.id, user])),
            refreshProjectDetails: () => {
                // Force refetch project details by temporarily setting projectId to null
                const currentId = projectId;
                setProjectId(null);
                requestAnimationFrame(() => {
                    setProjectId(currentId);
                });
            }
        }}>
            {children}
        </ProjectDetailsContext.Provider>
    );
}

export function useProjectDetails() {
    const context = useContext(ProjectDetailsContext);
    if (!context) {
        throw new Error('useProjectDetails must be used within a ProjectDetailsProvider');
    }
    return context;
}
