import { User } from "@/types/response";
import UserIcon from "./UserIcon";

interface UserItemProps {
    user: User;
    onClick?: () => void;
    actionType?: 'add' | 'remove' | 'none';
    onActionClick?: (e: React.MouseEvent) => void;
}

const UserItem = ({ user, onClick, actionType = 'none', onActionClick }: UserItemProps) => {
    return (
        <div 
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <UserIcon user={user} />
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                </div>
            </div>
            {actionType !== 'none' && (
                <button 
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={onActionClick}
                >
                    {actionType === 'add' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};

export default UserItem; 