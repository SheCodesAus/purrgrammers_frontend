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
    onColumnUpdate
}) {
    const [editTitle, setEditTitle] = useState(column.title || '');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showEditOptions, setShowEditOptions] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
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
            }`}
            style={{ '--column-color': column.color || 'transparent' }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
        >
            <div className="column-header">
                {/* Column Title - Click to Edit */}
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => {
                            handleTitleSave();
                            setIsEditingTitle(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleTitleSave();
                                setIsEditingTitle(false);
                            } else if (e.key === 'Escape') {
                                setEditTitle(column.title || '');
                                setIsEditingTitle(false);
                            }
                        }}
                        className="column-title-input"
                        maxLength={50}
                        autoFocus
                    />
                ) : (
                    <h3 
                        className="column-title clickable"
                        onClick={() => {
                            setEditTitle(column.title || '');
                            setIsEditingTitle(true);
                        }}
                        title="Click to edit"
                    >
                        {column.title}
                    </h3>
                )}
                
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
                                    '#FCA5A5', '#FDBA74', '#FDE047', '#A7F3D0', 
                                    '#67E8F9', '#93C5FD', '#C4B5FD', '#F9A8D4', 
                                    '#FB7185', '#F472B6', '#E879F9', '#C084FC',
                                    '#A78BFA', '#818CF8', '#60A5FA', '#34D399',
                                    '#4ADE80', '#84CC16', '#EAB308', '#FB923C',
                                    '#F87171', '#EC4899', '#D946EF', '#A855F7'
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
                            availableTags={availableTags}
                            onEdit={(newText) => onEditCard(card.id, newText)}
                            onDelete={() => onDeleteCard(card.id)}
                            onVoteChange={(voteData) => onVoteChange(card.id, voteData)}
                            onTagsChange={(updatedCard) => onCardTagsChange(column.id, updatedCard)}
                            onStartEdit={() => onSetEditingCard(card.id)}
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
        </div>
    );
}

export default Column;