import { User } from "@/types/response";
import { useState, useRef, useEffect } from "react";
import animations from "@/styles/animations.module.css";
import { createPortal } from "react-dom";

interface UserIconProps {
    user: User;
    onClick?: () => void;
    isSelected?: boolean;
}

const UserIcon = ({ user, onClick, isSelected = false }: UserIconProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isHovered && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX + (rect.width / 2)
            });
        }
    }, [isHovered]);

    return (
        <div 
            ref={iconRef}
            className={`relative group ${onClick ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isSelected ? 'ring-2 ring-blue-500' : ''
            }`}>
                {user.profilePicture ? (
                    <img 
                        src={user.profilePicture} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
            {isHovered && createPortal(
                <div 
                    className={`fixed px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-[70] ${animations.fadeIn}`}
                    style={{
                        top: `${tooltipPosition.top - 32}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: 'translateX(-50%)'
                    }}
                >
                    {user.name}
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserIcon; 