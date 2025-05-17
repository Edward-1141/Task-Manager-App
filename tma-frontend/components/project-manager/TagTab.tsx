import { useState } from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { toast } from 'react-toastify';
import { Tag } from '@/types/response';

interface TagTabProps {
    onUpdate: () => void;
}

export default function TagTab({ onUpdate }: TagTabProps) {
    const { projectDetailsData } = useProjectDetails();
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#000000');

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            toast.error('Tag name is required');
            return;
        }
        onUpdate();

        try {
            await projectDetailsData.tag.create({
                name: newTagName,
                color: newTagColor,
                project_id: projectDetailsData.projectDetails!.project.id
            });
            setNewTagName('');
            setNewTagColor('#000000');
            toast.success('Tag created successfully');
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error('Failed to create tag' + (error as Error).message || 'Unknown error');
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
            return;
        }
        onUpdate();

        try {
            // remove the tag from every task
            const tasks = projectDetailsData.projectDetails?.tasks;
            if (tasks) {
                for (const task of tasks) {
                    if (task.tag_ids.includes(tagId)) {
                        await projectDetailsData.updateTask({
                            id: task.id,
                            tag_ids: task.tag_ids.filter(id => id !== tagId)
                        });
                    }
                }
            }

            await projectDetailsData.tag.delete(tagId);
            toast.success('Tag deleted successfully');
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Failed to delete tag'+ (error as Error).message || 'Unknown error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Create New Tag</h3>
                <div className="flex gap-4">
                    <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-12 h-12 p-1 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tag name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleCreateTag}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Create
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-4">Existing Tags</h3>
                <div className="space-y-2">
                    {Object.values(projectDetailsData.projectDetails?.tag_map || {}).map((tag: Tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span>{tag.name}</span>
                            </div>
                            <button
                                onClick={() => handleDeleteTag(tag.id)}
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