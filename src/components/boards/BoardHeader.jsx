import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import patchBoard from '../../api/patch-board';
import deleteBoard from '../../api/delete-board';
import './BoardHeader.css';
import './CardPool.css';

function BoardHeader({ 
    boardData, 
    onTitleUpdate,  // function to update board title
    onBoardDelete   // function to handle board deletion
}) {
    const [editTitle, setEditTitle] = useState(boardData?.title || '');
    const [showEditOptions, setShowEditOptions] = useState(false);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const handleTitleSave = async () => {
        if (editTitle.trim() && editTitle !== boardData?.title) {
            try {
                const updatedBoard = await patchBoard(
                    boardData.id,
                    { title: editTitle.trim() },
                    auth.token
                );
                onTitleUpdate(updatedBoard.title);
            } catch (error) {
                console.error("Failed to update board title:", error);
                setEditTitle(boardData?.title || '');
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(boardData?.title || '');
        }
    };

    const handleDeleteBoard = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${boardData?.title}"? This action cannot be undone.`
        );
        
        if (!confirmDelete) {
            return;
        }

        try {
            await deleteBoard(boardData.id, auth.token);
            
            // Call parent callback to handle post-deletion (e.g., navigate away)
            if (onBoardDelete) {
                onBoardDelete(boardData.id);
            }
        } catch (error) {
            console.error("Failed to delete board:", error);
            alert(`Failed to delete board: ${error.message}`);
        }
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
            </div>

            <div className="board-title-section">
                <div className="title-input-container">
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleKeyPress}
                        onFocus={() => setShowEditOptions(true)}
                        className={`board-title-inline ${showEditOptions ? 'editable-indicator' : ''}`}
                        maxLength={100}
                        placeholder={boardData?.title || 'Board title'}
                    />
                </div>
            </div>

            <div className="board-header-right">
                <div className="board-metadata">
                    {boardData?.created_at && (
                        <div className="board-date-with-delete">
                            <div className="board-date">
                                <span className="date-label">Created:</span>
                                <span className="date-value">
                                    {formatDate(boardData.created_at)}
                                </span>
                            </div>
                            <button 
                                className="delete-board-btn" 
                                onClick={handleDeleteBoard}
                                title="Delete board"
                            >
                                <span className="material-icons">delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default BoardHeader;