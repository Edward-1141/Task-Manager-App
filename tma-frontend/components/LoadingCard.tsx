'use client'

const LoadingCard = () => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col border border-gray-200 h-[280px]">
            <div className="flex items-start justify-between mb-4">
                <div className="w-3/4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3 flex-grow">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingCard;
