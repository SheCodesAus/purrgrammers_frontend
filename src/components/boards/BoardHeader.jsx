import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import patchBoard from '../../api/patch-board';
import deleteBoard from '../../api/delete-board';
import getTeam from '../../api/get-team';
import addTeamMember from '../../api/add-team-member';
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
    const [showTeamSettings, setShowTeamSettings] = useState(false);
    const [teamDetails, setTeamDetails] = useState(null);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addMemberError, setAddMemberError] = useState('');
    const [addMemberLoading, setAddMemberLoading] = useState(false);

    // Fetch team details when board has a team
    useEffect(() => {
        const fetchTeamDetails = async () => {
            if (boardData?.team?.id && auth.token) {
                try {
                    const team = await getTeam(boardData.team.id, auth.token);
                    setTeamDetails(team);
                } catch (error) {
                    console.error("Failed to fetch team details:", error);
                }
            }
        };
        fetchTeamDetails();
    }, [boardData?.team?.id, auth.token]);

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

    const handleAddMember = async () => {
        if (!newMemberUsername.trim()) {
            return;
        }
        
        setAddMemberLoading(true);
        setAddMemberError('');
        
        try {
            await addTeamMember(boardData.team.id, newMemberUsername.trim(), auth.token);
            // Refresh team details to show new member
            const updatedTeam = await getTeam(boardData.team.id, auth.token);
            setTeamDetails(updatedTeam);
            setNewMemberUsername('');
        } catch (error) {
            console.error("Failed to add team member:", error);
            setAddMemberError(error.message);
        } finally {
            setAddMemberLoading(false);
        }
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
                {/* Team Settings Section */}
                {boardData?.team && (
                    <div className="team-settings-section">
                        <button 
                            className="team-settings-btn"
                            onClick={() => setShowTeamSettings(!showTeamSettings)}
                        >
                            <span className="material-icons">group</span>
                            {teamDetails?.name || boardData.team.name || 'Team'}
                        </button>
                        
                        {showTeamSettings && (
                            <div className="team-settings-dropdown">
                                <h4>Team Members</h4>
                                <ul className="team-members-list">
                                    {teamDetails?.members?.map((member) => (
                                        <li key={member.id}>{member.username}</li>
                                    ))}
                                </ul>
                                
                                <div className="add-member-form">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={newMemberUsername}
                                        onChange={(e) => setNewMemberUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                                    />
                                    <button 
                                        onClick={handleAddMember}
                                        disabled={addMemberLoading || !newMemberUsername.trim()}
                                    >
                                        {addMemberLoading ? 'Adding...' : 'Add'}
                                    </button>
                                </div>
                                {addMemberError && (
                                    <p className="add-member-error">{addMemberError}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
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