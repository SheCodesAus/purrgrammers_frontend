import { useState } from "react";
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
    const { auth } = useAuth();

    // Start editing mode
    const handleStartEdit = () => {
        setEditText(card.content || "");
        onStartEdit();
    };

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

    // Format date in Australian format (short)
    const formatDate = (dateString) => {
        if (!dateString) return "";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            
            return date.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short'
            }).replace(' ', ' '); // Ensure single space
        } catch (error) {
            console.warn("Invalid date format:", dateString);
            return "";
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
            className={`card ${columnType}`}
            style={{
                backgroundColor: columnColor || undefined
            }}
            onClick={handleStartEdit}
            title="Click to edit"
        >
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
            
            <div className="card-content">
                <p className="card-text">{card.content || "Click to edit"}</p>
            </div>

            <div className="card-footer">
                <div className="card-meta">
                    <span className="card-author">
                        {card.created_by?.username || card.created_by?.initials || card.author || "Anonymous"}
                    </span>
                    <span className="card-date">
                        {card.created_at ? formatDate(card.created_at) : ""}
                    </span>
                </div>

                <div className="card-actions">
                    <button 
                        onClick={handleStartEdit}
                        className="edit-btn"
                    >
                        Edit
                    </button>
                    
                    <button 
                        onClick={handleDelete}
                        className="delete-btn"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Card;
