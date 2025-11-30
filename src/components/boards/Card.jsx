import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/use-auth";
import patchCard from "../../api/patch-card";
import deleteCard from "../../api/delete-card";
import "./Card.css";

function Card({
    card,
    columnType,
    columnColor,
    isEditing,
    onEdit,
    onDelete,
    onStartEdit,
    onCancelEdit
}) {
    const [editText, setEditText] = useState("");
    const [fontSize, setFontSize] = useState(0.8); // rem
    const textRef = useRef(null);
    const contentRef = useRef(null);
    const { auth } = useAuth();

    // Auto-resize font to fit content
    useEffect(() => {
        if (!textRef.current || !contentRef.current || isEditing) return;
        
        const resizeText = () => {
            const container = contentRef.current;
            const text = textRef.current;
            
            // Reset to max size first
            let currentSize = 0.8;
            text.style.fontSize = `${currentSize}rem`;
            
            // Reduce font size until text fits (min 0.5rem)
            while (
                text.scrollHeight > container.clientHeight && 
                currentSize > 0.5
            ) {
                currentSize -= 0.05;
                text.style.fontSize = `${currentSize}rem`;
            }
            
            setFontSize(currentSize);
        };
        
        resizeText();
    }, [card.content, isEditing]);

    // Start editing mode
    const handleStartEdit = () => {
        if (!isOwner) return; // Only owner can edit
        setEditText(card.content || "");
        onStartEdit();
    };

    // Check if current user is the card creator
    const isOwner = auth.user?.id === card.created_by?.id || 
                    auth.user?.username === card.created_by?.username;

    // Save edited text
    const handleSave = async () => {
        if (editText.trim()) {
            try {
                const updatedCard = await patchCard(
                    card.id,
                    { content: editText.trim() },
                    auth.token
                );
                // Pass just the content string, not the full card object
                onEdit(updatedCard.content);
            } catch (error) {
                console.error("Failed to update card:", error);
                onCancelEdit(); // Fall back to cancel if error
            }
        } else {
            onCancelEdit();
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditText("");
        onCancelEdit();
    };

    // delete card
    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this card?');

        if (confirmDelete) {
            try {
                await deleteCard(card.id, auth.token);
                onDelete(); //call the existing onDelete prop to update parent state
            } catch (error) {
                console.error("Failed to delete card:", error);
                alert("Failed to delete card. Please try again");
            }
        }
    };

    if (isEditing) {
        return (
            <div 
                className={`card editing ${columnType}`}
                style={{
                    backgroundColor: columnColor || undefined
                }}
            >
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    placeholder="Enter your card text..."
                    className="card-edit-textarea"
                />
                <div className="edit-actions">
                    <button 
                        onClick={handleSave}
                        className="save-btn"
                        title="Save"
                    >
                        ✓
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="cancel-btn"
                        title="Cancel"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`card ${columnType} ${isOwner ? 'editable' : ''}`}
            style={{
                backgroundColor: columnColor || undefined
            }}
            onClick={isOwner ? handleStartEdit : undefined}
            title={isOwner ? "Click to edit" : ""}
        >
            {isOwner && (
                <button 
                    className="card-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    title="Delete card"
                >
                    <span className="material-icons">close</span>
                </button>
            )}
            
            <div className="card-content" ref={contentRef}>
                <p className="card-text" ref={textRef}>
                    {card.content || (isOwner ? "Click to edit" : "")}
                </p>
            </div>

            <div className="card-footer">
                <div className="card-meta">
                    <span className={`card-author ${card.is_anonymous ? 'anonymous' : ''}`}>
                        {card.is_anonymous ? "Anonymous" : (card.created_by?.username || card.created_by?.initials || card.author || "Anonymous")}
                    </span>
                </div>

                {isOwner && (
                    <div className="card-actions">
                        <button 
                            onClick={handleStartEdit}
                            className="edit-btn"
                        >
                            Edit
                        </button>
                        
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="delete-btn"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Card;
