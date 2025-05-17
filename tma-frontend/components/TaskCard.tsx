'use client'

import { Task, User, Status, Tag, UpdateTaskRequest } from "@/types/response";
import { useProjectDetails } from "@/contexts/ProjectDetailsContext";
import styles from '@/styles/card.module.css';
import AssignerUsers from "./task/AssignerUsers";
import TagList from "./task/TagList";
import TaskContent from "./task/TaskContent";
import StatusSelector from "./task/StatusSelector";
import { useState } from "react";
import TaskOverlay from "./TaskOverlay";

interface TaskCardProps {
    task: Task;
    // onTaskUpdate?: (updates: UpdateTaskRequest) => void;
    isLarge?: boolean;
}

const TaskCard = ({ task, isLarge = false }: TaskCardProps) => {
    const { projectDetailsData : { projectDetails }, userMap } = useProjectDetails();
    const [showOverlay, setShowOverlay] = useState(false);

    if (!projectDetails) {
        return null;
    }
    
    // Now you can use these maps to get the actual objects
    const assignedUsers: User[] = task.assigned_to.map(userId => userMap[userId]);
    const status: Status = projectDetails.status_map[task.status_id];
    const tags: Tag[] = task.tag_ids.map(tagId => projectDetails.tag_map[tagId]);
    const projectMembers = projectDetails.project.members?.map(userId => userMap[userId]);
    const allTags = Object.values(projectDetails.tag_map);
    const allStatuses = Object.values(projectDetails.status_map);
    const { projectDetailsData : { updateTask } } = useProjectDetails();

    const handleUsersChange = (userIds: number[]) => {
        updateTask({ id: task.id, assigned_to: userIds });
    };

    const handleTagsChange = (tagIds: number[]) => {
        updateTask({ id: task.id, tag_ids: tagIds });
    };

    const handleStatusChange = (statusId: number) => {
        updateTask({ id: task.id, status_id: statusId });
    };

    const handleContentChange = (content: string) => {
        updateTask({ id: task.id, content});
    };

    return (
        <>
            <div className={`${styles.cardNoHover} ${isLarge ? styles.cardLarge : ''} ${isLarge ? 'w-[400px] h-[500px]' : 'w-[300px] h-[360px]'}`}>
                <h1 className={`${styles.cardTitle} cursor-pointer hover:underline`} onClick={() => setShowOverlay(true)}>
                    {task.name}
                </h1>
                <div className="mt-2">
                    <AssignerUsers
                        assignedUsers={assignedUsers}
                        allUsers={projectMembers || []}
                        onUsersChange={handleUsersChange}
                        previewLimit={2}
                    />
                </div>
                <div className="mt-4">
                    <StatusSelector
                        currentStatus={status}
                        allStatuses={allStatuses}
                        onStatusChange={handleStatusChange}
                    />
                </div>
                <div className="mt-4 flex-grow">
                    <TaskContent
                        content={task.content}
                        onContentChange={handleContentChange}
                    />
                </div>
                <div className={styles.cardFooter}>
                    <TagList
                        selectedTags={tags}
                        allTags={allTags}
                        onTagsChange={handleTagsChange}
                        previewLimit={3}
                    />
                </div>
            </div>

            {showOverlay && (
                <TaskOverlay
                    task={task}
                    onClose={() => setShowOverlay(false)}
                />
            )}
        </>
    );
};

export default TaskCard;
