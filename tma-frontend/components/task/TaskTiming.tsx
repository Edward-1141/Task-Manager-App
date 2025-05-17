import { useState } from 'react';
import { format } from 'date-fns';

interface TaskTimingProps {
    startTime: string;
    endTime: string;
    onTimeUpdate?: (updates: { start_time?: string; end_time?: string }) => void;
}

const TaskTiming = ({ startTime, endTime, onTimeUpdate }: TaskTimingProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedStartTime, setEditedStartTime] = useState(startTime);
    const [editedEndTime, setEditedEndTime] = useState(endTime);

    const handleSave = () => {
        const updates: { start_time?: string; end_time?: string } = {};
        if (editedStartTime !== startTime) {
            updates.start_time = editedStartTime;
        }
        if (editedEndTime !== endTime) {
            updates.end_time = editedEndTime;
        }
        onTimeUpdate?.(updates);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedStartTime(startTime);
        setEditedEndTime(endTime);
        setIsEditing(false);
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Task Timeline</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors"
                    >
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            value={editedStartTime.slice(0, 16)}
                            onChange={(e) => setEditedStartTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                        </label>
                        <input
                            type="datetime-local"
                            value={editedEndTime.slice(0, 16)}
                            onChange={(e) => setEditedEndTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
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
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">Start Time</div>
                            <div className="text-sm text-gray-600">{formatDateTime(startTime)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">End Time</div>
                            <div className="text-sm text-gray-600">{formatDateTime(endTime)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskTiming; 