import { useState } from "react";

function Card({
    card,
    currentUser,
    isEditing,
    onEdit,
    onDelete,
    onStartEdit,
    onCancelEdit
}) {
    const [editText, setEditText] = useState("");

    // Start editing mode
    const handleStartEdit = () => {
        setEditText(card.text);
        onStartEdit();
    };

    // Save edited text
    const handleSave = () => {
        if (editText.trim()) {
            onEdit(editText.trim());
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
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short'
        });
    };

    if (isEditing) {
        return (
            <div className="card editing">
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
            className="card"
            onDoubleClick={handleStartEdit}
            title="Double-click to edit"
        >
            <div className="card-content">
                <p className="card-text">{card.text}</p>
            </div>

            <div className="card-footer">
                <div className="card-meta">
                    <span className="card-author">{card.author}</span>
                    <span className="card-date">
                        {formatDate(card.createdAt)}
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
