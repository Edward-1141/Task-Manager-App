import { useEffect, useState } from 'react';
import { User, Status, Tag, CreateTaskRequest } from "@/types/response";
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import AssignerUsers from "./task/AssignerUsers";
import TagList from "./task/TagList";
import StatusSelector from "./task/StatusSelector";

interface NewTaskModalProps {
    onClose: () => void;
    onSubmit: (taskData: CreateTaskRequest) => void;
}

const NewTaskModal = ({ onClose, onSubmit }: NewTaskModalProps) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const { projectId } = useProjectDetails();
    const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
    const [endTime, setEndTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));

    const { projectDetailsData: { projectDetails }, userMap } = useProjectDetails();


    const allUsers = projectDetails?.project.members?.map(member => userMap[member]) || [];
    const tagMap = projectDetails?.tag_map;
    const statusMap = projectDetails?.status_map;
    const allTags = tagMap ? Object.values(tagMap) : [];
    const allStatuses = statusMap ? Object.values(statusMap) : [];

    useEffect(() => {
        if (!selectedStatus) {
            setSelectedStatus(allStatuses[0]);
        }
    }, [allStatuses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !content || !selectedStatus) return;

        console.log(projectId);

        onSubmit({
            name,
            content,
            status_id: selectedStatus.id,
            tag_ids: selectedTags.map(tag => tag.id),
            assigned_to: selectedUsers.map(user => user.id),
            start_time: new Date(startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            priority: 1,
            project_id: projectId!
        });
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold text-gray-900">Create New Task</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Task Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter task name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-28 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Enter task description"
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <StatusSelector
                                currentStatus={selectedStatus || allStatuses[0]}
                                allStatuses={allStatuses}
                                onStatusChange={(statusId) => setSelectedStatus(allStatuses.find(s => s.id === statusId) || null)}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assign Users
                            </label>
                            <AssignerUsers
                                assignedUsers={selectedUsers}
                                allUsers={allUsers}
                                onUsersChange={(userIds) => setSelectedUsers(userIds.map(id => {
                                    if (userMap[id]) {
                                        return userMap[id];
                                    }
                                    return null;
                                }).filter(user => user !== null))}
                                previewLimit={5}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <TagList
                            selectedTags={selectedTags}
                            allTags={allTags}
                            onTagsChange={(tagIds) => setSelectedTags(
                                tagIds.map(id => tagMap ? tagMap[id]! : null)
                                    .filter(tag => tag !== null)
                            )}
                            previewLimit={5}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTaskModal; 