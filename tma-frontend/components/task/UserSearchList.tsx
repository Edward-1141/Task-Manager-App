import { User } from "@/types/response";
import UserList from "./UserList";

interface UserSearchListProps {
    title: string;
    users: User[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    actionType: "add" | "remove";
    onUserAction: (user: User) => void;
}

const UserSearchList = ({
    title,
    users,
    searchQuery,
    onSearchChange,
    actionType,
    onUserAction
}: UserSearchListProps) => {
    return (
        <div>
            <h4 className="text-lg font-semibold mb-3">{title}</h4>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <UserList
                users={users}
                actionType={actionType}
                onUserAction={onUserAction}
            />
        </div>
    );
};

export default UserSearchList; 