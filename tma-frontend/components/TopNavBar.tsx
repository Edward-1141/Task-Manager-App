'use client'

import Logo from './navigation/Logo'
import NavigationMenu from './navigation/NavigationMenu'
import UserIcon from './navigation/UserIcon'

const TopNavBar = () => {
    return (
        <nav className="bg-gray-50 border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="flex items-center justify-between px-10 py-4">
                {/* Left section with Logo and Navigation */}
                <div className="flex items-center space-x-8">
                    <Logo />
                    <NavigationMenu />
                </div>

                {/* Right section with User Icon */}
                <UserIcon />
            </div>
        </nav>
    )
}

export default TopNavBar 