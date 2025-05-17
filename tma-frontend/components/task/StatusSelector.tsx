import { Status } from "@/types/response";
import { useState, useRef, useEffect } from "react";
import animations from "@/styles/animations.module.css";

interface StatusSelectorProps {
    currentStatus: Status;
    allStatuses: Status[];
    onStatusChange: (statusId: number) => void;
}

const StatusSelector = ({ currentStatus, allStatuses, onStatusChange }: StatusSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const darkenHexColor = (hex: string) => {
        // Remove the # if present
        hex = hex.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Darken by reducing each component by 40%
        const darkenFactor = 0.6;
        const newR = Math.floor(r * darkenFactor);
        const newG = Math.floor(g * darkenFactor);
        const newB = Math.floor(b * darkenFactor);
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors"
                style={{ backgroundColor: currentStatus.color + '20', color: darkenHexColor(currentStatus.color) }}
            >
                {currentStatus.name}
                {!isOpen ? (
                    <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />

                    </svg>
                ) : (
                    <svg 
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                        />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className={`absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 ${animations.slideDown}`}>
                    <div className="flex flex-col gap-2">
                        {allStatuses.sort((a, b) => a.name.localeCompare(b.name)).map((status) => (
                            <button
                                key={status.id}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                                    status.id === currentStatus.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                                style={{ backgroundColor: status.color + '20', color: darkenHexColor(status.color) }}
                                onClick={() => {
                                    onStatusChange(status.id);
                                    setIsOpen(false);
                                }}
                            >
                                {status.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusSelector; 