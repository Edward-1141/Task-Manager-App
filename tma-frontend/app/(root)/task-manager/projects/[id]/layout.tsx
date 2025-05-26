'use client'

import { ProjectDetailsProvider } from "@/contexts/ProjectDetailsContext";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useProjectDetails } from "@/contexts/ProjectDetailsContext";

// Separate component that will use the ProjectDetailsProvider
function ProjectTitleUpdater() {
    const { projectDetailsData } = useProjectDetails();
    
    useEffect(() => {
        if (projectDetailsData.projectDetails?.project.name) {
            document.title = `${projectDetailsData.projectDetails.project.name} | Task Manager`;
        } else {
            document.title = 'Task Manager';
        }
    }, [projectDetailsData.projectDetails?.project.name]);

    return null;
}

export default function ProjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const id = parseInt(params.id as string);
    const [projectId, setProjectId] = useState<number | null>(id);

    useEffect(() => {
        setProjectId(id);
    }, [id]);

    return (
        <ProjectDetailsProvider projectId={projectId} setProjectId={setProjectId}>
            <ProjectTitleUpdater />
            {children}
        </ProjectDetailsProvider>
    );
}