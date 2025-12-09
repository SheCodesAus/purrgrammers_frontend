import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { TwitterPicker } from 'react-color';
import Card from "./Card";
import './Column.css';
import patchColumn from "../../api/patch-column";

function Column({
    column,
    currentUser,
    dragState,
    editingCard,
    remainingVotes,
    maxVotesPerCard,
    votingEnabled,
    availableTags,
    onEditCard,
    onDeleteCard,
    onVoteChange,
    onCardTagsChange,
    onSetEditingCard,
    onDeleteColumn,
    onDragOver,
    onDrop,
    onDragEnter,
    onDragLeave,
    onColumnUpdate,
    onAddCard
}) {
    const [editTitle, setEditTitle] = useState(column.title || '');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showEditOptions, setShowEditOptions] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => window.innerWidth <= 768);
    const { auth } = useAuth();

    // handles title editing
    const handleTitleSave = async () => {
        if (editTitle.trim() && editTitle !== column.title) {
            try {
                const updatedColumn = await patchColumn(
                    column.id,
                    { title: editTitle.trim() },
                    auth.token
                );
                onColumnUpdate(updatedColumn);
            } catch (error) {
                console.error("Failed to update column title:", error);
                setEditTitle(column.title || '');
            }
        }
        // Note: removed setIsEditingTitle since it's no longer needed
    };

    const handleTitleCancel = () => {
        // Note: removed setIsEditingTitle since it's no longer needed
        setEditTitle('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            handleTitleCancel();
        }
    };

    // handles colour editing
    const handleColorChange = async (color) => {
        const newColor = color.hex;
        try {
            const updatedColumn = await patchColumn(
                column.id,
                { color: newColor },
                auth.token
            );
            onColumnUpdate(updatedColumn);
            setShowColorPicker(false); // Close picker after selection
        } catch (error) {
            console.error("Failed to update column color:", error);
        }
    };

    // Reset color to default
    const handleResetColor = async () => {
        // Define default colors based on column type
        const defaultColors = {
            start: '#d3bdff',
            stop: '#ffd3a8', 
            continue: '#d3bdff'
        };
        
        const defaultColor = defaultColors[column.column_type] || '#e2e8f0';
        
        try {
            const updatedColumn = await patchColumn(
                column.id,
                { color: defaultColor },
                auth.token
            );
            onColumnUpdate(updatedColumn);
        } catch (error) {
            console.error("Failed to reset column color:", error);
        }
    };

    return (
        <div 
            className={`retro-column ${column.column_type} ${
                dragState.dragOverColumn === column.id ? 'drag-over' : ''
            } ${isCollapsed ? 'collapsed' : ''}`}
            style={{ '--column-color': column.color || 'transparent' }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
        >
            <div className="column-header">
                {/* Collapse Toggle Button - Left side */}
                <button 
                    className="column-collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand column" : "Collapse column"}
                >
                    <span className="material-icons">
                        {isCollapsed ? 'expand_more' : 'expand_less'}
                    </span>
                </button>

                {/* Column Title - Click to Edit */}
                {isEditingTitle ? (
                    <>
                        <textarea
                            value={editTitle}
                            onChange={(e) => {
                                setEditTitle(e.target.value);
                                // Auto-resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onBlur={() => {
                                handleTitleSave();
                                setIsEditingTitle(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleTitleSave();
                                    setIsEditingTitle(false);
                                } else if (e.key === 'Escape') {
                                    setEditTitle(column.title || '');
                                    setIsEditingTitle(false);
                                }
                            }}
                            className="column-title-input"
                            autoFocus
                            rows={1}
                            ref={(el) => {
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                }
                            }}
                        />
                        <button
                            className="column-cancel-title-btn mobile-only"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur from firing first
                                setEditTitle(column.title || '');
                                setIsEditingTitle(false);
                            }}
                            title="Cancel"
                        >
                            <span className="material-icons">close</span>
                        </button>
                        <button
                            className="column-confirm-title-btn mobile-only"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent blur from firing first
                                handleTitleSave();
                                setIsEditingTitle(false);
                            }}
                            title="Confirm title"
                        >
                            <span className="material-icons">check</span>
                        </button>
                    </>
                ) : (
                    <>
                        <h3 
                            className="column-title clickable"
                            onClick={() => {
                                // Only allow click-to-edit on desktop
                                if (window.innerWidth > 768) {
                                    setEditTitle(column.title || '');
                                    setIsEditingTitle(true);
                                }
                            }}
                            title="Click to edit"
                        >
                            {column.title}
                            {isCollapsed && column.cards?.length > 0 && (
                                <span className="column-card-count">({column.cards.length})</span>
                            )}
                        </h3>
                        <button
                            className="column-edit-title-btn mobile-only"
                            onClick={() => {
                                setEditTitle(column.title || '');
                                setIsEditingTitle(true);
                            }}
                            title="Edit column title"
                        >
                            <span className="material-icons">edit</span>
                        </button>
                    </>
                )}

                {/* Add Card Button - Mobile only */}
                <button 
                    className="column-add-card-btn"
                    onClick={onAddCard}
                    title="Add card"
                >
                    <span className="material-icons">add</span>
                </button>
                
                {/* Edit Menu Button */}
                <div className="column-menu-wrapper">
                    <button 
                        className="column-menu-btn" 
                        onClick={() => {
                            if (!showEditOptions) {
                                setEditTitle(column.title || '');
                            }
                            setShowEditOptions(!showEditOptions);
                        }}
                        title="Column options"
                    >
                        <span className="material-icons">more_vert</span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showEditOptions && (
                        <>
                            <div 
                                className="column-menu-overlay"
                                onClick={() => {
                                    setShowEditOptions(false);
                                    setShowColorPicker(false);
                                }}
                            />
                            <div className="column-menu-dropdown">
                                {/* Color Option */}
                                <button 
                                    className="menu-item"
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                    title="Change Color"
                                >
                                    <span className="material-icons">palette</span>
                                </button>
                                
                                {/* Reset Color Option */}
                                <button 
                                    className="menu-item"
                                    onClick={() => {
                                        handleResetColor();
                                        setShowEditOptions(false);
                                    }}
                                    title="Reset Color"
                                >
                                    <span className="material-icons">refresh</span>
                                </button>
                                
                                <div className="menu-divider" />
                                
                                {/* Delete Option */}
                                <button 
                                    className="menu-item menu-item-danger"
                                    onClick={() => {
                                        onDeleteColumn(column.id);
                                        setShowEditOptions(false);
                                    }}
                                    title="Delete Column"
                                >
                                    <span className="material-icons">delete</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Color Picker */}
                {showColorPicker && showEditOptions && (
                    <div className="color-picker-popup">
                        <div 
                            className="color-picker-overlay"
                            onClick={() => setShowColorPicker(false)}
                        />
                        <div className="twitter-picker-container">
                            <TwitterPicker
                                color={column.color || '#e2e8f0'}
                                onChange={handleColorChange}
                                colors={[
                                    // Default column colors
                                    '#d3bdff', '#ffd3a8', '#e2e8f0',
                                    // Light pastels - easy to read text
                                    '#FEE2E2', '#FFEDD5', '#FEF9C3', '#DCFCE7', 
                                    '#CFFAFE', '#DBEAFE', '#EDE9FE', '#FCE7F3',
                                    '#FED7AA', '#D9F99D', '#A7F3D0', '#BAE6FD',
                                    '#DDD6FE', '#FBCFE8', '#FDE68A', '#E0E7FF',
                                    '#F5D0FE', '#FECACA', '#E9D5FF', '#D1FAE5',
                                    '#CCFBF1', '#C7D2FE', '#FECDD3', '#FEF3C7'
                                ]}
                                triangle="top-left"
                            />
                            <button 
                                className="picker-close-btn"
                                onClick={() => setShowColorPicker(false)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Collapsible content */}
            {!isCollapsed && (
                <div className="column-content">
                    <div className="cards-list">
                        {column.cards?.map(card => (
                            <Card
                                key={card.id}
                                card={card}
                                columnType={column.column_type}
                                columnColor={column.color}
                                columnTitle={column.title}
                                currentUser={currentUser}
                                isEditing={editingCard === card.id}
                                remainingVotes={remainingVotes}
                                maxVotesPerCard={maxVotesPerCard}
                                votingEnabled={votingEnabled}
                                availableTags={availableTags}
                                onEdit={(newText) => onEditCard(card.id, newText)}
                                onDelete={() => onDeleteCard(card.id)}
                                onVoteChange={(voteData) => onVoteChange(card.id, voteData)}
                                onTagsChange={(updatedCard) => onCardTagsChange(column.id, updatedCard)}
                                onCancelEdit={() => onSetEditingCard(null)}
                            />
                        ))}
                    </div>

                    {/* Drop zone hint when dragging */}
                    {dragState.isDragging && (
                        <div className="drop-zone-hint">
                            Drop your card here
                        </div>
                    )}

                    {/* Empty state */}
                    {!column.cards?.length && !dragState.isDragging && (
                        <div className="empty-column">
                            <p>No cards yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Column;