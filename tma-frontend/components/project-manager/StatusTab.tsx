import { useState } from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { toast } from 'react-toastify';
import { Status } from '@/types/response';

interface StatusTabProps {
    onUpdate: () => void;
}

export default function StatusTab({ onUpdate }: StatusTabProps) {
    const { projectDetailsData } = useProjectDetails();
    const [newStatusName, setNewStatusName] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#58E701');

    const handleCreateStatus = async () => {
        if (!newStatusName.trim()) {
            toast.error('Status name is required');
            return;
        }
        onUpdate();

        try {
            await projectDetailsData.status.create({
                name: newStatusName,
                description: '',
                color: newStatusColor,
                project_id: projectDetailsData.projectDetails!.project.id
            });
            setNewStatusName('');
            toast.success('Status created successfully');
        } catch (error) {
            console.error('Error creating status:', error);
            toast.error('Failed to create status'+ (error as Error).message || 'Unknown error');
        }
    };

    const handleDeleteStatus = async (statusId: number) => {
        if (Object.keys(projectDetailsData.projectDetails?.status_map || {}).length === 1) {
            toast.error('Cannot delete the only status');
            return;
        }

        if (!confirm('Are you sure you want to delete this status? This action cannot be undone.')) {
            return;
        }
        onUpdate();

        try {
            const tasks = projectDetailsData.projectDetails?.tasks;
            if (tasks) {
                // find a random status id that is not the statusId
                const randomStatusId = Object.values(projectDetailsData.projectDetails?.status_map || {}).filter(status => status.id !== statusId)[0].id;

                for (const task of tasks) {
                    if (task.status_id === statusId) {
                        await projectDetailsData.updateTask({
                            id: task.id,
                            status_id: randomStatusId
                        });
                    }
                }
            }
            await projectDetailsData.status.delete(statusId);
            toast.success('Status deleted successfully');
        } catch (error) {
            console.error('Error deleting status:', error);
            toast.error('Failed to delete status'+ (error as Error).message || 'Unknown error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New Status</h3>
                <div className="flex gap-4">
                    <input
                        type="color"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                        className="w-12 h-12 p-1 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        value={newStatusName}
                        onChange={(e) => setNewStatusName(e.target.value)}
                        placeholder="Status name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateStatus}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Existing Statuses</h3>
                <div className="space-y-1">
                    {Object.values(projectDetailsData.projectDetails?.status_map || {}).map((status: Status) => (
                        <div
                            key={status.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                />
                                <span>{status.name}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteStatus(status.id)}
                                className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-500 transition-colors cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 