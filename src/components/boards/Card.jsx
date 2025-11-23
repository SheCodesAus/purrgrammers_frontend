import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import patchCard from "../../api/patch-card";
import "./Card.css";

function Card({
    card,
    columnType,
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

    // Format date in Australian format (short)
    const formatDate = (dateString) => {
        if (!dateString) return "";
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            
            return date.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short'
            });
        } catch (error) {
            console.warn("Invalid date format:", dateString);
            return "";
        }
    };

    if (isEditing) {
        return (
            <div className={`card editing ${columnType}`}>
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
                    >
                        Save
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="cancel-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`card ${columnType}`}
            onDoubleClick={handleStartEdit}
            title="Double-click to edit"
        >
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
                        onClick={() => {
                            if (window.confirm('Delete this card?')) {
                                onDelete();
                            }
                        }}
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
