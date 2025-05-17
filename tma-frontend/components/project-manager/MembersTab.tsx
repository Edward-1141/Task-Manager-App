import { useState } from 'react';
import { useProjectDetails } from '@/contexts/ProjectDetailsContext';
import { useUserContext } from '@/contexts/UserContext';
import { toast } from 'react-toastify';
import { User } from '@/types/response';
import UserList from '../task/UserList';
import UserSearchList from '../task/UserSearchList';

interface MembersTabProps {
    onUpdate: () => void;
}

export default function MembersTab({ onUpdate }: MembersTabProps) {
    const { projectDetailsData, userMap } = useProjectDetails();
    const { users, isLoading, error } = useUserContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [projectMembers, setProjectMembers] = useState<Array<number>>(
        projectDetailsData.projectDetails?.project.members || []
    );

    const handleMembersChange = async (userIds: number[]) => {
        onUpdate();
        setProjectMembers(userIds);
        try {
            await projectDetailsData.updateProject({
                id: projectDetailsData.projectDetails!.project.id,
                members: userIds
            });
            toast.success('Project members updated successfully');
        } catch (error) {
            console.error('Error updating project members:', error);
            toast.error('Failed to update project members'+ (error as Error).message || 'Unknown error');
        }
    };

    const getProjectMembers = (): User[] => {
        if (!projectDetailsData.projectDetails) return [];
        return Array.from(projectMembers)
            .map(id => userMap[id])
            .filter(Boolean);
    };

    const getAllUsers = (): User[] => {
        if (!users) return [];
        return users.filter(user => !getProjectMembers().some(member => member.id === user.id));
    };

    if (isLoading || error) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-4">Project Members</h3>
                <UserList
                    users={projectMembers.map(id => userMap[id])}
                    actionType="remove"
                    onUserAction={(user) => {
                        handleMembersChange(getProjectMembers().filter(u => u.id !== user.id).map(u => u.id));
                    }}
                />
                <UserSearchList
                    title="Add Members"
                    users={getAllUsers()}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    actionType="add"
                    onUserAction={(user) => {
                        handleMembersChange([...getProjectMembers().map(u => u.id), user.id]);
                    }}
                />
            </div>
        </div>
    );
} 