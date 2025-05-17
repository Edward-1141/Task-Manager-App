'use client'

import { useRouter } from 'next/navigation';
import { ProjectOverview } from "@/types/response";
import styles from '@/styles/card.module.css';
import animations from '@/styles/animations.module.css';
import { formatTimeAgo } from '@/utils/timeFormat';

interface ProjectCardProps {
    project: ProjectOverview;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    const router = useRouter();

    // Generate a consistent color based on project name
    const getProjectColor = (name: string) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    return (
        <div 
            onClick={() => router.push(`/task-manager/projects/${project.id}`)}
            className={`${styles.card} group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-[280px] w-full z-0`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getProjectColor(project.name)} flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                            {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className={`${styles.cardTitle} text-gray-900 group-hover:text-blue-600 transition-colors duration-200`}>
                                {project.name}
                            </h2>
                            <p className={`${styles.cardDescription} text-gray-600 group-hover:text-gray-700 transition-colors duration-200 mt-1`}>
                                {project.description || 'No description provided'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Active
                        </span>
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Last updated {project.updated_at ? formatTimeAgo(project.updated_at) : '2h ago'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{project.num_members ?? 3} members</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard;
