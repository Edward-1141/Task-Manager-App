'use client'

import Logo from './navigation/Logo'
import NavigationMenu from './navigation/NavigationMenu'
import UserIcon from './navigation/UserIcon'

const TopNavBar = () => {
    return (
        <nav className="bg-gray-50 border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="flex items-center justify-between px-4 sm:px-10">
                {/* Left section with Logo */}
                <div className="flex-shrink-0">
                    <Logo />
                </div>

                {/* Middle section with scrollable Navigation */}
                <div className="flex-1 mx-4 overflow-x-auto scrollbar-hide">
                    <div className="min-w-max">
                        <NavigationMenu />
                    </div>
                </div>

                {/* Right section with User Icon */}
                <div className="flex-shrink-0">
                    <UserIcon />
                </div>
            </div>
        </nav>
    )
}

export default TopNavBar 