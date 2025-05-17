import { useState } from 'react';
import { User, CreateProjectRequest } from '@/types/response';
import { useUserContext } from '@/contexts/UserContext';
import AssignerUsers from './task/AssignerUsers';
import animations from '@/styles/animations.module.css';

interface NewProjectModalProps {
    onClose: () => void;
    onSubmit: (projectData: CreateProjectRequest) => void;
}

const NewProjectModal = ({ onClose, onSubmit }: NewProjectModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
    const { users, isLoading, error } = useUserContext();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const newErrors: { name?: string; description?: string } = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            members: selectedUsers.map(user => user.id)
        });
    };
    
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }


    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className={`bg-white rounded-lg shadow-xl w-[90%] max-w-2xl ${animations.scaleIn}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-semibold">Create New Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Title
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter project name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-60 ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter project description"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Members
                        </label>
                        <AssignerUsers
                            assignedUsers={selectedUsers}
                            allUsers={users}
                            onUsersChange={(userIds) => {
                                setSelectedUsers(users.filter(user => userIds.includes(user.id)));
                            }}
                            previewLimit={5}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProjectModal; 