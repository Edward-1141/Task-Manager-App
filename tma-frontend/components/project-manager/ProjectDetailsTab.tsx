import { useState } from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { toast } from 'react-toastify';

interface ProjectDetailsTabProps {
    initialName: string;
    initialDescription: string;
    onUpdate: () => void;
    closeTab: () => void;
}

export default function ProjectDetailsTab({ initialName, initialDescription, onUpdate, closeTab }: ProjectDetailsTabProps) {
    const { projectDetailsData } = useProjectDetails();
    const [projectName, setProjectName] = useState(initialName);
    const [projectDescription, setProjectDescription] = useState(initialDescription);
    const [updating, setUpdating] = useState(false);

    const handleUpdateProject = async () => {
        // Check if the anything changed
        if (projectName === initialName && projectDescription === initialDescription) {
            toast.info('No changes made');
            closeTab();
            return;
        }

        try {
            setUpdating(true);
            await projectDetailsData.updateProject({
                id: projectDetailsData.projectDetails!.project.id,
                name: projectName,
                description: projectDescription,
            });
            onUpdate();
            toast.success('Project updated successfully');
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('Failed to update project'+ (error as Error).message || 'Unknown error');
        } finally {
            setUpdating(false);
            closeTab();
        }

    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                </label>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />
            </div>
            <button
                onClick={() => {
                    handleUpdateProject();
                }}
                disabled={updating}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
                {updating ? 'Updating...' : 'Update Project'}
            </button>
        </div>
    );
} 