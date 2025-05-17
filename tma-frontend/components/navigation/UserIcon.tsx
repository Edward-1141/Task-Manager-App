import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

const UserIcon = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div className="relative flex" ref={dropdownRef}>
            <button 
                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            </button>

            <div 
                className={`absolute right-0 mt-10 w-48 bg-white rounded-xl shadow-lg pt-4 py-2 z-10 transform transition-all duration-200 ease-in-out ${
                    isOpen 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
            >
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <div className="flex justify-center mb-2">
                    <svg
                        className="w-12 h-12 text-gray-600 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
                <div className="px-2 py-2 text-md text-gray-700 text-center w-full font-bold">
                    {user?.name || 'User'}
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 block w-40 text-center px-4 py-2 text-base font-bold text-white hover:bg-red-400 mx-auto my-1 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span className="mr-1">Logout</span>
                </button>
            </div>
        </div>
    )
}

export default UserIcon 