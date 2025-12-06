import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useToast } from '../ToastProvider';
import { useConfirm } from '../ConfirmProvider';
import Avatar from '../Avatar';
import ProfileModal from '../ProfileModal';
import patchBoard from '../../api/patch-board';
import deleteBoard from '../../api/delete-board';
import getTeam from '../../api/get-team';
import addTeamMember from '../../api/add-team-member';
import deleteTeamMember from '../../api/delete-team-member';
import './BoardHeader.css';
import './CardPool.css';

function BoardHeader({ 
    boardData, 
    onTitleUpdate,  // function to update board title
    onBoardDelete,  // function to handle board deletion
    onBoardStatusChange,  // function to handle board active status change
    onTeamRefreshReady, // function to update team on team member addtion or deletion
}) {
    const [editTitle, setEditTitle] = useState(boardData?.title || '');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [showEditOptions, setShowEditOptions] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [showTeamSettings, setShowTeamSettings] = useState(false);
    const [teamDetails, setTeamDetails] = useState(null);
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addMemberError, setAddMemberError] = useState('');
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const teamDropdownRef = useRef(null);

    // Sync editTitle when boardData.title changes from WebSocket
    useEffect(() => {
        setEditTitle(boardData?.title || '');
    }, [boardData?.title]);

    // Close team dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showTeamSettings &&
                teamDropdownRef.current &&
                !teamDropdownRef.current.contains(event.target)
            ) {
                setShowTeamSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTeamSettings]);

    // Fetch team details when board has a team
    const fetchTeamDetails = useCallback(async () => {
        if (boardData?.team?.id && auth.token) {
            try {
                const team = await getTeam(boardData.team.id, auth.token);
                setTeamDetails(team);
            } catch (error) {
                console.error("Failed to fetch team details", error);
            }
        }
    }, [boardData?.team?.id, auth.token]);

    // calls on mount and when dependencies change
    useEffect(() => {
        fetchTeamDetails();
    }, [fetchTeamDetails]);

    // pass the refresh function up to a parent
    useEffect(() => {
        if (onTeamRefreshReady) {
            onTeamRefreshReady(fetchTeamDetails);
        }
    }, [onTeamRefreshReady, fetchTeamDetails]);

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
            e.target.blur();
        } else if (e.key === 'Escape') {
            setEditTitle(boardData?.title || '');
            e.target.blur();
        }
    };

    const handleDeleteBoard = async () => {
        const confirmDelete = await confirm({
            title: 'Delete Board',
            message: `Are you sure you want to delete ${boardData.title}? This action cannot be undone.`
        });
        
        
        if (!confirmDelete) return;

        try {
            await deleteBoard(boardData.id, auth.token);
            
            // Call parent callback to handle post-deletion (e.g., navigate away)
            if (onBoardDelete) {
                onBoardDelete(boardData.id);
            }
        } catch (error) {
            console.error("Failed to delete board:", error);
            showToast(`Failed to delete board: ${error.message}`);
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

    const handleRemoveMember = async (userId, username) => {
        const confirmRemove = await confirm({
            title: 'Remove Team Member',
            message: `Are you sure you want to remove "${username}" from this team?`
        });

        if (!confirmRemove) return;

        try {
            await deleteTeamMember(boardData.team.id, userId, auth.token);
            const team = await getTeam(boardData.team.id, auth.token);
            setTeamDetails(team);
            showToast(`${username} removed from team`, 'success');
        } catch (error) {
            console.error('Failed to remove member', error);
            showToast(`Failed to remove member: ${error.message}`, 'error');
        }
    };

    const handleToggleActive = async () => {
        const newStatus = !boardData?.is_active;
        const action = newStatus ? 'reopen' : 'close';
        
        const confirmed = await confirm({
            title: `${newStatus ? 'Reopen' : 'Close'} Board`,
            message: `Are you sure you want to ${action} this board?`,
            confirmLabel: 'Yes'
        })
        
        if (!confirmed) return;
        
        setIsToggling(true);
        try {
            const updatedBoard = await patchBoard(
                boardData.id,
                { is_active: newStatus },
                auth.token
            );
            if (onBoardStatusChange) {
                onBoardStatusChange(updatedBoard.is_active);
            }
        } catch (error) {
            console.error("Failed to update board status:", error);
            showToast(`Failed to ${action} board: ${error.message}`);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <>
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
                                    e.target.blur();
                                } else if (e.key === 'Escape') {
                                    setEditTitle(boardData?.title || '');
                                    setIsEditingTitle(false);
                                    e.target.blur();
                                }
                            }}
                            className="board-title-input"
                            maxLength={100}
                            autoFocus
                        />
                    ) : (
                        <h1 
                            className="board-title clickable"
                            onClick={() => {
                                setEditTitle(boardData?.title || '');
                                setIsEditingTitle(true);
                            }}
                            title="Click to edit"
                        >
                            {boardData?.title}
                        </h1>
                    )}
                    {boardData?.is_active === false && (
                        <span className="board-closed-badge">CLOSED</span>
                    )}
                </div>
            </div>

            <div className="board-header-right">
                {/* Team Settings Section */}
                {boardData?.team && (
                    <div className="team-settings-section" ref={teamDropdownRef}>
                        <button 
                            className="team-settings-btn"
                            onClick={() => setShowTeamSettings(!showTeamSettings)}
                        >
                            {teamDetails?.name || boardData.team.name || 'Team'}
                            <span className="material-icons">group</span>
                            {teamDetails?.members?.length || 0}
                        </button>
                       
                        
                        {showTeamSettings && (
                            <div className="team-settings-dropdown">
                                <h4>Team Members ({teamDetails?.members?.length || 0})</h4>
                                <ul className="team-members-list">
                                    {teamDetails?.members?.map((member) => (
                                        <li key={member.id}>
                                            <div 
                                                className="member-info clickable"
                                                onClick={() => setSelectedMember(member)}
                                                title="View profile"
                                            >
                                                <Avatar initials={member.initials} userId={member.id} size={24} />
                                                <span>{member.username}</span>
                                            </div>
                                            <button
                                                className='remove-member-btn'
                                                onClick={() => handleRemoveMember(member.id, member.username)}
                                                title='Remove member'
                                            >
                                                <span className='material-icons'>close</span>
                                            </button>
                                            </li>
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
                            <button 
                                className={`toggle-status-btn ${boardData?.is_active ? 'open' : 'closed'}`}
                                onClick={handleToggleActive}
                                disabled={isToggling}
                                title={boardData?.is_active ? 'Close board' : 'Reopen board'}
                            >
                                <span className="material-icons">
                                    {boardData?.is_active ? 'lock_open' : 'lock'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>

            {/* Member Profile Modal */}
            <ProfileModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                userId={selectedMember?.id}
                username={selectedMember?.username}
            />
        </>
    );
}

export default BoardHeader;