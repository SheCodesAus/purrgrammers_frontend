import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BoardHeader({ 
    boardData, 
    onTitleUpdate  // function to update board title
}) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const navigate = useNavigate();

    const handleTitleClick = () => {
        setEditTitle(boardData?.title || '');
        setIsEditingTitle(true);
    };

    const handleTitleSave = async () => {
        if (editTitle.trim() && editTitle !== boardData?.title) {
            await onTitleUpdate(editTitle.trim());
        }
        setIsEditingTitle(false);
    };

    const handleTitleCancel = () => {
        setIsEditingTitle(false);
        setEditTitle('');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <header className="board-header">
            <div className="board-header-left">
                <button 
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    ← Back
                </button>

                <div className="board-title-section">
                    {isEditingTitle ? (
                        <div className="title-edit-mode">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                className="title-edit-input"
                                autoFocus
                                maxLength={100}
                            />
                            <div className="edit-hints">
                                <button onClick={handleTitleSave} className="save-btn">Save</button>
                                <button onClick={handleTitleCancel} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <h1 
                            className="board-title editable"
                            onClick={handleTitleClick}
                            title="Click to edit title"
                        >
                            {boardData?.title || 'Untitled Board'}
                        </h1>
                    )}
                </div>
            </div>

            <div className="board-header-right">
                <div className="board-metadata">
                    {boardData?.created_at && (
                        <div className="board-date">
                            <span className="date-label">Created:</span>
                            <span className="date-value">
                                {formatDate(boardData.created_at)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default BoardHeader;