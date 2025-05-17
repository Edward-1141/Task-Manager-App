'use client'

import { useAuth } from "@/contexts/AuthContext";

const UserMetaCard = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                Basic Information
            </h4>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        {
                            user?.profilePicture ? (
                                <img
                                    src={user?.profilePicture}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <svg
                                    className="text-gray-600 cursor-pointer"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="-6 -4 35 35"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            )
                        }
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={user?.name}
                            readOnly
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                        />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email}
                            readOnly
                            placeholder="email@example.com"
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Phone
                        </label>
                        <input
                            type="tel"
                            readOnly
                            placeholder="+1 (555) 000-0000"
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMetaCard; 