import { Tag as TagType } from "@/types/response";
import { useState, useRef, useEffect } from "react";
import { useProjectDetails } from "@/contexts/ProjectDetailsContext";
import Tag from "./Tag";
import animations from "@/styles/animations.module.css";

interface TagListProps {
    selectedTags: TagType[];
    allTags: TagType[];
    onTagsChange: (tagIds: number[]) => void;
    previewLimit: number;
}

const TagList = ({ selectedTags, allTags, onTagsChange, previewLimit }: TagListProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#58E701");
    const { projectDetailsData } = useProjectDetails();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleCreateTag = () => {
        if (newTagName.trim()) {
            projectDetailsData.tag.create({
                name: newTagName,
                color: newTagColor,
                project_id: projectDetailsData.projectDetails!.project.id
            });
            setNewTagName("");
        }
    };

    const previewTags = selectedTags.sort((a, b) => a.name.localeCompare(b.name)).slice(0, previewLimit);
    const remainingCount = selectedTags.length - previewLimit;

    // Filter out already selected tags from the options list
    const availableTags = allTags.filter(tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id));

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex flex-wrap items-center gap-2">
                {previewTags.sort((a, b) => a.name.localeCompare(b.name)).map((tag) => (
                    <Tag
                        key={tag.id}
                        tag={tag}
                        onClick={() => { setIsOpen((prev) => !prev) }}
                    />
                ))}
                {remainingCount > 0 && (
                    <button
                        onClick={() => setIsOpen(prev => !prev)}
                        className="text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                    >
                        +{remainingCount} more
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                    <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Tags
                </button>
            </div>

            {isOpen && (
                <div className={`absolute top-full -left-2 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 ${animations.slideDown}`}>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedTags.sort((a, b) => a.name.localeCompare(b.name)).map((tag) => (
                                <Tag
                                    key={tag.id}
                                    tag={tag}
                                    showRemove={true}
                                    onClick={() => {
                                        onTagsChange(selectedTags.filter(t => t.id !== tag.id).map(t => t.id));
                                    }}
                                />
                            ))}
                        </div>

                        <p className="text-sm text-gray-500 mb-3">Select an option or create one</p>

                        <div className="space-y-1 max-h-48 overflow-y-auto mb-3">
                            {availableTags.sort((a, b) => a.name.localeCompare(b.name)).map((tag) => (
                                <div
                                    key={tag.id}
                                    onClick={() => {
                                        onTagsChange([...selectedTags, tag].map(t => t.id));
                                    }}
                                    className="flex items-center px-2 py-0.5 rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                    <Tag
                                        tag={tag}
                                        className="text-xs py-0.5 px-1.5"
                                    />
                                </div>
                            ))}
                            { newTagName.length > 0 && (
                                <div className="flex items-center px-2 py-0.5 rounded-md cursor-pointer hover:bg-gray-50">
                                    <Tag
                                        tag={{ id: 0, name: newTagName, color: newTagColor }}
                                        className="text-xs py-0.5 px-1.5"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row items-stretch gap-2 pt-3 border-t w-full">
                            <div className="flex-1">
                                <input
                                    type="color"
                                    value={newTagColor}
                                    onChange={(e) => setNewTagColor(e.target.value)}
                                    className="w-full h-7 cursor-pointer rounded-md"
                                />
                            </div>

                            <div className="flex-[5]">
                                <input
                                    type="text"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Tag name"
                                    className="w-full h-8 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
                                />
                            </div>

                            <div className="flex-2">
                                <button
                                    onClick={handleCreateTag}
                                    className="w-full h-8 flex justify-center items-center text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagList; 