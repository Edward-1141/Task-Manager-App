import { useState, useEffect } from 'react';
import styles from '@/styles/card.module.css';
import animations from "@/styles/animations.module.css";

interface TaskContentProps {
    content: string;
    onContentChange?: (content: string) => void;
}

const TaskContent = ({ content, onContentChange }: TaskContentProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEditing) {
                setIsEditing(false);
                setEditedContent(content);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isEditing]);

    const handleSave = () => {
        if (editedContent !== content) {
            onContentChange?.(editedContent);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedContent(content);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        }
    };

    if (isEditing) {
        return (
            <>
                <div className={`${styles.overlay} ${animations.fadeIn}`} onClick={() => setIsEditing(false)} />
                <div className={`${styles.cardContentExpanded} ${animations.fadeIn}`}>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold">Edit Task Description</h2>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex flex-col h-[calc(100%-80px)]">
                        <p className="text-sm text-gray-500 mb-2">Press Ctrl + Enter to save</p>
                        <div className="flex-1 min-h-0">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full h-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
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
                </div>
            </>
        );
    }

    return (
        <div 
            className={`${styles.cardContent} text-gray-600 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg`}
            onClick={() => setIsEditing(true)}
        >
            <div className={styles.cardContentText}>
                {content || 'Click to add description...'}
            </div>
        </div>
    );
};

export default TaskContent; 