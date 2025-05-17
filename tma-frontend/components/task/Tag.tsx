import { Tag as TagType } from "@/types/response";

interface TagProps {
    tag: TagType;
    onClick?: () => void;
    isSelected?: boolean;
    className?: string;
    showRemove?: boolean;
}

const Tag = ({ tag, onClick, isSelected = false, className = '', showRemove = false }: TagProps) => {
    // Function to darken a hex color
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

    return (
        <div
            className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium cursor-pointer transition-colors font-bold ${
                isSelected ? 'ring-2 ring-blue-500' : ''
            } ${className}`}
            style={{ 
                backgroundColor: tag.color + '20',
                color: darkenHexColor(tag.color),
            }}
            onClick={onClick}
        >
            {tag.name}
            {showRemove && (
                <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            )}
        </div>
    );
};

export default Tag;