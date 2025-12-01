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
    onEditCard,
    onDeleteCard,
    onVoteChange,
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
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
        >
            <div className="column-header">
                {/* Editable Title */}
                    <div className="title-and-edit">
                        <div className="title-input-container">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={handleKeyPress}
                                onFocus={() => setEditTitle(column.title || '')}
                                className={`column-title-inline ${showEditOptions ? 'editable-indicator' : ''}`}
                                maxLength={50}
                                placeholder={column.title || 'Column title'}
                                style={{ paddingRight: showEditOptions ? '20px' : '4px' }}
                            />
                        </div>
                        
                        {showEditOptions && (
                            <>
                                <button onClick={handleResetColor} className="edit-option-btn reset-btn" title="Reset color">
                                    <span className="material-icons">refresh</span>
                                </button>
                                <button onClick={() => setShowColorPicker(!showColorPicker)} className="edit-option-btn" title="Change color">
                                    <span className="material-symbols-outlined">colors</span>
                                </button>
                                <button onClick={() => onDeleteColumn(column.id)} className="edit-option-btn delete-btn" title="Delete column">
                                    <span className="material-icons">delete</span>
                                </button>
                            </>
                        )}
                        
                       
                        <button 
                            className="edit-toggle-btn" 
                            onClick={() => {
                                setShowEditOptions(!showEditOptions);
                                if (!showEditOptions) {
                                    setEditTitle(column.title || '');
                                }
                            }}
                            title="Edit column"
                        >
                            <span className="material-icons">edit</span>
                        </button>
                        
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

                <div className="column-count">
                    {column.cards?.length || 0} {(column.cards?.length || 0) === 1 ? 'card' : 'cards'}
                </div>
            </div>

            <div className="column-content">
                <div className="cards-list">
                    {column.cards?.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            columnType={column.column_type}
                            columnColor={column.color}
                            currentUser={currentUser}
                            isEditing={editingCard === card.id}
                            remainingVotes={remainingVotes}
                            onEdit={(newText) => onEditCard(card.id, newText)}
                            onDelete={() => onDeleteCard(card.id)}
                            onVoteChange={(voteData) => onVoteChange(card.id, voteData)}
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