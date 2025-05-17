'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProjectsDropdown from './ProjectsDropdown'
import styles from '@/styles/navigation.module.css'
const NavigationMenu = () => {
    const pathname = usePathname()

    return (
        <div className="flex items-center space-x-8 font-bold">
            <Link
                href="/task-manager/your-workspace"
                className={`${styles.navLink} ${
                    pathname.startsWith('/task-manager/your-workspace')
                        ? styles.navLinkActive
                        : styles.navLinkInactive
                }`}
            >
                Your Workspace
            </Link>
            <ProjectsDropdown />
            <Link
                href="/task-manager/profile"
                className={`${styles.navLink} ${
                    pathname.startsWith('/task-manager/profile')
                        ? styles.navLinkActive
                        : styles.navLinkInactive
                }`}
            >
                Profile
            </Link>
        </div>
    )
}

export default NavigationMenu 