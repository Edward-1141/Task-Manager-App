import { useState } from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import ProjectDetailsTab from './project-manager/ProjectDetailsTab';
import MembersTab from './project-manager/MembersTab';
import StatusTab from './project-manager/StatusTab';
import TagTab from './project-manager/TagTab';

interface ProjectManagementOverlayProps {
    onClose: () => void;
}

export default function ProjectManagementOverlay({ onClose }: ProjectManagementOverlayProps) {
    const { projectDetailsData, refreshProjectDetails } = useProjectDetails();
    const [updated, setUpdated] = useState(false);
    const [activeTab, setActiveTab] = useState<'project' | 'status' | 'tag' | 'members'>('project');

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[150vh] overflow-y-auto border border-gray-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Project Management</h2>
                    <button
                        onClick={() => {
                            onClose();
                            if (updated) {
                                refreshProjectDetails();
                            }
                            setUpdated(false);
                        }}
                        className="text-gray-100 cursor-pointer bg-red-500 rounded-full p-2 hover:bg-red-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('project')}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                            activeTab === 'project'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Project Details
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                            activeTab === 'members'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab('status')}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                            activeTab === 'status'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Statuses
                    </button>
                    <button
                        onClick={() => setActiveTab('tag')}
                        className={`px-4 py-2 rounded-lg cursor-pointer ${
                            activeTab === 'tag'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Tags
                    </button>
                </div>

                {activeTab === 'project' && (
                    <ProjectDetailsTab
                        initialName={projectDetailsData.projectDetails?.project.name || ''}
                        initialDescription={projectDetailsData.projectDetails?.project.description || ''}
                        onUpdate={() => {
                            refreshProjectDetails();
                        }}
                        closeTab={() => {
                            onClose();
                            setUpdated(false);
                        }}
                    />
                )}

                {activeTab === 'members' && <MembersTab onUpdate={() => setUpdated(true)} />}
                {activeTab === 'status' && <StatusTab onUpdate={() => setUpdated(true)} />}
                {activeTab === 'tag' && <TagTab onUpdate={() => setUpdated(true)} />}
            </div>
        </div>
    );
} 