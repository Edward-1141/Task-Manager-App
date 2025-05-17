import { User } from "@/types/response";
import UserItem from "./UserItem";

interface UserListProps {
    users: User[];
    actionType: "add" | "remove";
    onUserAction: (user: User) => void;
}

const UserList = ({
    users,
    actionType,
    onUserAction
}: UserListProps) => {
    return (
        <div className={`${users.length > 0 ? 'max-h-[180px]' : 'h-0'} overflow-y-auto pr-2`}>
            <div className="grid grid-cols-1 gap-4">
                {users.sort((a, b) => a.name.localeCompare(b.name)).map((user) => (
                    <UserItem
                        key={user.id}
                        user={user}
                        actionType={actionType}
                        onClick={() => onUserAction(user)}
                        onActionClick={(e) => {
                            e.stopPropagation();
                            onUserAction(user);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default UserList; 