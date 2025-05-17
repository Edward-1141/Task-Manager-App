'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserProjects } from '@/contexts/UserProjectsContext'
import styles from '@/styles/navigation.module.css'

const ProjectsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()
    const { userProjects, isLoading } = useUserProjects()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.navLink} ${
                    pathname.startsWith('/task-manager/projects')
                        ? styles.navLinkActive
                        : styles.navLinkInactive
                }`}
            >
                Projects {isOpen ? '▲' : '▼'}
            </button>
            <div 
                className={`absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-100 ease-in-out transform origin-top ${
                    isOpen 
                        ? 'opacity-100 scale-y-100' 
                        : 'opacity-0 scale-y-0 pointer-events-none'
                }`}
            >
                {isLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                ) : userProjects?.projects.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No projects found</div>
                ) : (
                    userProjects?.projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/task-manager/projects/${project.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsOpen(false)}
                        >
                            {project.name}
                        </Link>
                    ))
                )}
                <div className="border-t border-gray-100">
                    <Link
                        href="/task-manager/your-workspace"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                    >
                        View All Projects
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProjectsDropdown 