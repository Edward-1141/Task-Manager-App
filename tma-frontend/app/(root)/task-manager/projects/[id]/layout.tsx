'use client'

import { ProjectDetailsProvider } from "@/contexts/ProjectDetailsContext";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
            {children}
        </ProjectDetailsProvider>
    );
}