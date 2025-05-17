import { Task, User, Status, Tag } from "@/types/response";
import AssignerUsers from "./task/AssignerUsers";
import TagList from "./task/TagList";
import StatusSelector from "./task/StatusSelector";
import TaskTiming from "./task/TaskTiming";
import { useState } from "react";
import { taskService } from "@/services/taskService";
import { toast } from "react-toastify";
import { useProjectDetails } from "@/contexts/ProjectDetailsContext";

interface TaskOverlayProps {
    task: Task;
    onClose: () => void;
}

const TaskOverlay = ({ task, onClose }: TaskOverlayProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.name);
    const [editedContent, setEditedContent] = useState(task.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const { projectDetailsData: { projectDetails, updateTask }, userMap, refreshProjectDetails } = useProjectDetails();

    if (!projectDetails) {
        return null;
    }

    const assignedUsers: User[] = task.assigned_to.map(userId => userMap[userId]);
    const status: Status = projectDetails.status_map[task.status_id];
    const tags: Tag[] = task.tag_ids.map(tagId => projectDetails.tag_map[tagId]);
    const projectMembers = projectDetails.project.members?.map(userId => userMap[userId]) || [];
    const allTags = Object.values(projectDetails.tag_map);
    const allStatuses = Object.values(projectDetails.status_map);
    const creator: User = userMap[task.created_by];

    const handleUsersChange = (userIds: number[]) => {
        updateTask({ id: task.id, assigned_to: userIds });
    };

    const handleTagsChange = (tagIds: number[]) => {
        updateTask({ id: task.id, tag_ids: tagIds });
    };

    const handleStatusChange = (statusId: number) => {
        updateTask({ id: task.id, status_id: statusId });
    };

    const handleSave = () => {
        if (editedTitle !== task.name) {
            updateTask({ id: task.id, name: editedTitle });
        }
        if (editedContent !== task.content) {
            updateTask({ id: task.id, content: editedContent });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTitle(task.name);
        setEditedContent(task.content);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(true);
            await taskService.deleteTask(task.id);
            toast.success('Task deleted successfully');
            onClose();
            refreshProjectDetails();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error deleting task:' + (error as Error).message || 'Unknown error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-200"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden transform transition-all duration-200 ease-out"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="text-2xl font-semibold w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                        ) : (
                            <h1 className="text-2xl font-semibold">{task.name}</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-500 block w-30 text-center py-2 text-base font-medium text-white hover:bg-red-400 mx-auto my-1 rounded-lg cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Task'}
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    <div className="space-y-6">
                        <div>
                            <AssignerUsers
                                assignedUsers={assignedUsers}
                                allUsers={projectMembers}
                                onUsersChange={handleUsersChange}
                                previewLimit={5}
                            />
                        </div>

                        <div>
                            <StatusSelector
                                currentStatus={status}
                                allStatuses={allStatuses}
                                onStatusChange={handleStatusChange}
                            />
                        </div>

                        <div>
                            {isEditing ? (
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            ) : (
                                <div 
                                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                    onClick={() => setIsEditing(true)}
                                >
                                    {task.content || 'Click to add description...'}
                                </div>
                            )}
                        </div>

                        <div>
                            <TagList
                                selectedTags={tags}
                                allTags={allTags}
                                onTagsChange={handleTagsChange}
                                previewLimit={10}
                            />
                        </div>

                        <TaskTiming
                            startTime={task.start_time}
                            endTime={task.end_time}
                            onTimeUpdate={(updates) => updateTask({ id: task.id, ...updates })}
                        />

                        <div className="space-y-2 text-xs text-gray-500 border-t pt-4">
                            <div className="flex items-center gap-2">
                                <span>Created by {creator.name}</span>
                                <span>•</span>
                                <span>{formatDate(task.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Last updated</span>
                                <span>•</span>
                                <span>{formatDate(task.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskOverlay; 