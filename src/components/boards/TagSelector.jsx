import { useState, useRef, useEffect } from 'react';
import { getTagColor } from '../../utils/tag-colors';
import './TagSelector.css';

function TagSelector({ 
    selectedTags = [], 
    availableTags = [], 
    onTagsChange,
    disabled = false 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleTagToggle = (tag) => {
        if (disabled) return;
        
        const isSelected = selectedTags.some(t => t.id === tag.id);
        let newTags;
        
        if (isSelected) {
            newTags = selectedTags.filter(t => t.id !== tag.id);
        } else {
            newTags = [...selectedTags, tag];
        }
        
        onTagsChange(newTags);
    };

    const handleRemoveTag = (e, tagId) => {
        e.stopPropagation();
        if (disabled) return;
        
        const newTags = selectedTags.filter(t => t.id !== tagId);
        onTagsChange(newTags);
    };

    return (
        <div className="tag-selector" ref={dropdownRef}>
            {/* Selected Tags Display */}
            <div className="tag-selector__tags">
                {selectedTags.map(tag => {
                    const colors = getTagColor(tag.name);
                    return (
                        <span 
                            key={tag.id}
                            className="tag-selector__tag"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                            {tag.display_name}
                            {!disabled && (
                                <button
                                    className="tag-selector__remove"
                                    onClick={(e) => handleRemoveTag(e, tag.id)}
                                    title="Remove tag"
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    );
                })}
                
                {!disabled && (
                    <button
                        className="tag-selector__add-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        title="Add tags"
                    >
                        <span className="material-icons">
                            {isOpen ? 'expand_less' : 'add'}
                        </span>
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="tag-selector__dropdown">
                    {availableTags.length === 0 ? (
                        <div className="tag-selector__empty">No tags available</div>
                    ) : (
                        availableTags.map(tag => {
                            const isSelected = selectedTags.some(t => t.id === tag.id);
                            const colors = getTagColor(tag.name);
                            return (
                                <button
                                    key={tag.id}
                                    className={`tag-selector__option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    <span 
                                        className="tag-selector__option-color"
                                        style={{ backgroundColor: colors.bg }}
                                    />
                                    <span className="tag-selector__option-name">
                                        {tag.display_name}
                                    </span>
                                    {isSelected && (
                                        <span className="material-icons tag-selector__check">check</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default TagSelector;
