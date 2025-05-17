import { useState } from 'react';

type ViewType = 'overview' | 'timeline' | 'tags' | 'status';

interface ProjectViewBarProps {
    onViewChange: (view: ViewType) => void;
    currentView: ViewType;
}

export default function ProjectViewBar({ onViewChange, currentView }: ProjectViewBarProps) {
    const views: { id: ViewType; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📋' },
        { id: 'timeline', label: 'Timeline', icon: '📅' },
        { id: 'tags', label: 'Tags', icon: '🏷️' },
        { id: 'status', label: 'Status', icon: '📊' },
    ];

    return (
        <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b-4 border-gray-200">
            <div className="max-w-7xl mx-aut sm:px-6 lg:px-8">
                <div className="flex space-x-1 py-3">
                    {views.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => onViewChange(view.id)}
                            className={`flex items-center px-6 py-2.5 rounded-lg transition-all duration-200 ${
                                currentView === view.id
                                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                                    : 'text-gray-600 hover:bg-white/50 hover:text-blue-600'
                            }`}
                        >
                            <span className="mr-2">{view.icon}</span>
                            {view.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
} 