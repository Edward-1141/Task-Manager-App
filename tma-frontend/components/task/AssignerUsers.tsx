import { User } from "@/types/response";
import { useState, useRef, useEffect } from "react";
import UserIcon from "./UserIcon";
import UserList from "./UserList";
import UserSearchList from "./UserSearchList";
import animations from "@/styles/animations.module.css";

interface AssignerUsersProps {
    assignedUsers: User[];
    allUsers: User[];
    onUsersChange: (userIds: number[]) => void;
    previewLimit: number;
}

const AssignerUsers = ({ assignedUsers, allUsers, onUsersChange, previewLimit }: AssignerUsersProps) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOverlay(false);
            }
        };

        const handleOverlayClick = (event: MouseEvent) => {
            if (showOverlay && event.target === event.currentTarget) {
                setShowOverlay(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowOverlay(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('mousedown', handleOverlayClick);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('mousedown', handleOverlayClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showOverlay]);

    const previewUsers = assignedUsers.slice(0, previewLimit);
    const remainingCount = assignedUsers.length - previewLimit;

    const remainingUsers = allUsers.filter(user => !assignedUsers.some(assigned => assigned.id === user.id));
    const filteredRemainingUsers = remainingUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {previewUsers.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
                        <UserIcon 
                            key={user.id} 
                            user={user}
                        />
                    ))}
                </div>
                {remainingCount > 0 && (
                    <button
                        onClick={() => setShowOverlay((prev) => !prev)}
                        className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                    >
                        +{remainingCount} more
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setShowOverlay((prev) => !prev)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                </button>
            </div>

            {showOverlay && (
                <div 
                    className={`fixed inset-0 flex items-center justify-center z-50 ${animations.fadeIn}`}
                    onClick={(e) => e.target === e.currentTarget && setShowOverlay(false)}
                >
                    <div className={`bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl border border-gray-200 ${animations.scaleIn}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Assigned Users</h3>
                            <button
                                onClick={() => setShowOverlay(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className={`overflow-y-auto pr-2 ${assignedUsers.length > 0 ? 'max-h-[180px]' : 'h-0'}`}>
                            <UserList
                                users={assignedUsers}
                                actionType="remove"
                                onUserAction={(user) => {
                                    onUsersChange(assignedUsers.filter(u => u.id !== user.id).map(u => u.id));
                                }}
                            />
                        </div>

                        <div className={`mt-6 ${assignedUsers.length === 0 ? 'mt-0' : ''}`}>
                            <UserSearchList
                                title="Add Members"
                                users={filteredRemainingUsers}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                actionType="add"
                                onUserAction={(user) => {
                                    onUsersChange([...assignedUsers, user].map(u => u.id));
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignerUsers; 