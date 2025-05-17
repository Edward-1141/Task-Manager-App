'use client';

import { useEffect } from 'react';

export default function Error({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
                {error.message || "Something went wrong"}
            </h2>
            <p className="text-gray-600 mb-4">
                {error.name === 'NetworkError'
                    ? "Please check your internet connection and try again."
                    : "An unexpected error occurred. Please try again later."}
            </p>
        </div>
    );
} 