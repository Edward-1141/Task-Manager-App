'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserProjects } from '@/contexts/UserProjectsContext'
import styles from '@/styles/navigation.module.css'
import { createPortal } from 'react-dom'

const ProjectsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const triggerRef = useRef<HTMLButtonElement>(null)
    const pathname = usePathname()
    const { userProjects, isLoading } = useUserProjects()

    // Update dropdown position when opened
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX
            })
        }
    }, [isOpen])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                // if the click is on a link, don't close the dropdown
                if ((event.target as HTMLElement).closest('a')) {
                    return
                }
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.navLink} ${
                    pathname.startsWith('/task-manager/projects')
                        ? styles.navLinkActive
                        : styles.navLinkInactive
                }`}
            >
                Projects {isOpen ? '▲' : '▼'}
            </button>
            {isOpen && createPortal(
                <div 
                    className={`fixed w-48 bg-white rounded-md shadow-lg py-1 z-50 transition-all duration-100 ease-in-out transform ${
                        isOpen 
                            ? 'opacity-100 scale-100' 
                            : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        transformOrigin: 'top left'
                    }}
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
                </div>,
                document.body
            )}
        </div>
    )
}

export default ProjectsDropdown 