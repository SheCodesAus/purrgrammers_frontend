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
import addFacilitator from '../../api/add-facilitator';
import removeFacilitator from '../../api/remove-facilitator';
import './BoardHeader.css';
import './CardPool.css';

function BoardHeader({ 
    boardData, 
    onTitleUpdate,  // function to update board title
    onBoardDelete,  // function to handle board deletion
    onBoardStatusChange,  // function to handle board active status change
    onTeamRefreshReady, // function to update team on team member addtion or deletion
    onAddColumn, // function to add a new column (mobile)
    onFacilitatorsChange, // function to update facilitators list
    onPermissionsChange, // function to update participant permissions
    mobileControls, // render prop for mobile controls button
    // Permission props
    isFacilitator,
    canEditBoardTitle,
    canEditColumns,
    // Voting settings props
    maxVotesPerRound,
    maxVotesPerCard,
    onVotingSettingsChange,
    onStartVoting,
    onStopVoting,
    onResetRounds,
    currentVotingRound,
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
    
    // Voting settings state
    const [showVotingSettings, setShowVotingSettings] = useState(false);
    const [editMaxPerRound, setEditMaxPerRound] = useState(maxVotesPerRound ?? 5);
    const [editMaxPerCard, setEditMaxPerCard] = useState(maxVotesPerCard ?? '');
    const votingSettingsRef = useRef(null);

    // Board Permissions state
    const [showPermissions, setShowPermissions] = useState(false);
    const [newFacilitatorUsername, setNewFacilitatorUsername] = useState('');
    const [addFacilitatorLoading, setAddFacilitatorLoading] = useState(false);
    const [addFacilitatorError, setAddFacilitatorError] = useState('');
    const [permissionToggles, setPermissionToggles] = useState({
        participants_can_edit_columns: boardData?.participants_can_edit_columns ?? false,
        participants_can_edit_board_title: boardData?.participants_can_edit_board_title ?? false,
        participants_can_delete_any_card: boardData?.participants_can_delete_any_card ?? false,
    });
    const permissionsRef = useRef(null);

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
            if (
                showVotingSettings &&
                votingSettingsRef.current &&
                !votingSettingsRef.current.contains(event.target)
            ) {
                setShowVotingSettings(false);
            }
            if (
                showPermissions &&
                permissionsRef.current &&
                !permissionsRef.current.contains(event.target)
            ) {
                setShowPermissions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTeamSettings, showVotingSettings, showPermissions]);

    // Sync voting settings when props change
    useEffect(() => {
        setEditMaxPerRound(maxVotesPerRound ?? 5);
    }, [maxVotesPerRound]);

    useEffect(() => {
        setEditMaxPerCard(maxVotesPerCard ?? '');
    }, [maxVotesPerCard]);

    // Sync permission toggles when boardData changes
    useEffect(() => {
        setPermissionToggles({
            participants_can_edit_columns: boardData?.participants_can_edit_columns ?? false,
            participants_can_edit_board_title: boardData?.participants_can_edit_board_title ?? false,
            participants_can_delete_any_card: boardData?.participants_can_delete_any_card ?? false,
        });
    }, [boardData?.participants_can_edit_columns, boardData?.participants_can_edit_board_title, boardData?.participants_can_delete_any_card]);

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

    // Facilitator management handlers
    const handleAddFacilitator = async () => {
        if (!newFacilitatorUsername.trim()) return;

        setAddFacilitatorLoading(true);
        setAddFacilitatorError('');

        try {
            // Find user ID from team members by username
            const member = teamDetails?.members?.find(
                m => m.username.toLowerCase() === newFacilitatorUsername.trim().toLowerCase()
            );
            
            if (!member) {
                setAddFacilitatorError('User must be a team member');
                setAddFacilitatorLoading(false);
                return;
            }

            const result = await addFacilitator(boardData.id, member.id, auth.token);
            if (onFacilitatorsChange) {
                onFacilitatorsChange(result.facilitators);
            }
            setNewFacilitatorUsername('');
            showToast(result.message, 'success');
        } catch (error) {
            console.error('Failed to add facilitator:', error);
            setAddFacilitatorError(error.message);
        } finally {
            setAddFacilitatorLoading(false);
        }
    };

    const handleRemoveFacilitator = async (userId, username, isCreator) => {
        if (isCreator) {
            showToast('Cannot remove the board creator as facilitator', 'error');
            return;
        }

        const confirmRemove = await confirm({
            title: 'Remove Facilitator',
            message: `Remove "${username}" as a facilitator? They will still be able to participate but won't have facilitator permissions.`
        });

        if (!confirmRemove) return;

        try {
            const result = await removeFacilitator(boardData.id, userId, auth.token);
            if (onFacilitatorsChange) {
                onFacilitatorsChange(result.facilitators);
            }
            showToast(result.message, 'success');
        } catch (error) {
            console.error('Failed to remove facilitator:', error);
            showToast(error.message, 'error');
        }
    };

    const handlePermissionToggle = async (permissionKey) => {
        const newValue = !permissionToggles[permissionKey];
        
        // Optimistically update UI
        setPermissionToggles(prev => ({
            ...prev,
            [permissionKey]: newValue
        }));

        try {
            const updatedBoard = await patchBoard(
                boardData.id,
                { [permissionKey]: newValue },
                auth.token
            );
            if (onPermissionsChange) {
                onPermissionsChange(updatedBoard);
            }
        } catch (error) {
            console.error('Failed to update permission:', error);
            // Revert on error
            setPermissionToggles(prev => ({
                ...prev,
                [permissionKey]: !newValue
            }));
            showToast(error.message, 'error');
        }
    };

    const handleSaveVotingSettings = () => {
        const settings = {
            max_votes_per_round: parseInt(editMaxPerRound, 10) || 5,
            max_votes_per_card: editMaxPerCard === '' || editMaxPerCard === null ? null : parseInt(editMaxPerCard, 10)
        };
        onVotingSettingsChange(settings);
        setShowVotingSettings(false);
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
            {/* Desktop only: Back button in separate section */}
            <div className="board-header-left desktop-only">
                <button 
                    className="back-button"
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    ← Back
                </button>
            </div>

            <div className="board-title-section">
                {/* Mobile only: Back button inline with title */}
                <button 
                    className="back-button mobile-only"
                    onClick={() => navigate('/dashboard')}
                    title="Back to Dashboard"
                >
                    <span className="material-icons">arrow_back</span>
                </button>
                <div className="title-wrapper">
                    <div className="title-input-container">
                        {isEditingTitle ? (
                            <>
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
                                <button
                                    className="board-cancel-title-btn mobile-only"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setEditTitle(boardData?.title || '');
                                        setIsEditingTitle(false);
                                    }}
                                    title="Cancel"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                                <button
                                    className="board-confirm-title-btn mobile-only"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleTitleSave();
                                        setIsEditingTitle(false);
                                    }}
                                    title="Confirm title"
                                >
                                    <span className="material-icons">check</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 
                                    className={`board-title ${canEditBoardTitle ? 'clickable' : ''}`}
                                    onClick={() => {
                                        // Only allow click-to-edit on desktop if user has permission
                                        if (canEditBoardTitle && window.innerWidth > 768) {
                                            setEditTitle(boardData?.title || '');
                                            setIsEditingTitle(true);
                                        }
                                    }}
                                    title={canEditBoardTitle ? "Click to edit" : boardData?.title}
                                >
                                    {boardData?.title}
                                </h1>
                                {canEditBoardTitle && (
                                    <button
                                        className="board-edit-title-btn mobile-only"
                                        onClick={() => {
                                            setEditTitle(boardData?.title || '');
                                            setIsEditingTitle(true);
                                        }}
                                        title="Edit board title"
                                    >
                                        <span className="material-icons">edit</span>
                                    </button>
                                )}
                            </>
                        )}
                        {boardData?.is_active === false && (
                            <span className="board-closed-badge">CLOSED</span>
                        )}
                    </div>
                    {/* Creator info */}
                    <div className="board-meta-info">
                        {boardData?.created_by?.username && (
                            <span className="board-creator">
                                by {boardData.created_by.username}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="board-header-right">
                {/* Voting Settings Section - Only for facilitators */}
                {isFacilitator && (
                <div className="voting-settings-section" ref={votingSettingsRef}>
                    <button 
                        className={`voting-settings-btn ${currentVotingRound ? 'voting-active' : ''}`}
                        onClick={() => setShowVotingSettings(!showVotingSettings)}
                        title="Voting settings"
                    >
                        <span className="material-icons">how_to_vote</span>
                        <span className="voting-settings-label">Voting</span>
                        <span className="material-icons voting-settings-arrow">
                            {showVotingSettings ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                    
                    {showVotingSettings && (
                        <div className="voting-settings-dropdown">
                            <button 
                                className="voting-dropdown-close"
                                onClick={() => setShowVotingSettings(false)}
                                title="Close"
                            >
                                <span className="material-icons">close</span>
                            </button>
                            <h4>Voting Settings</h4>
                            <div className="voting-setting-row">
                                <label>Votes per round:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="99"
                                    value={editMaxPerRound}
                                    onChange={(e) => setEditMaxPerRound(e.target.value)}
                                />
                            </div>
                            <div className="voting-setting-row">
                                <label>Limit per card:</label>
                                <button 
                                    className={`voting-toggle ${editMaxPerCard === '' ? '' : 'active'}`}
                                    onClick={() => setEditMaxPerCard(editMaxPerCard === '' ? '3' : '')}
                                >
                                    <span className="voting-toggle-slider"></span>
                                </button>
                            </div>
                            {editMaxPerCard !== '' && (
                                <div className="voting-setting-row voting-setting-indent">
                                    <label>Max votes:</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="99"
                                        value={editMaxPerCard}
                                        onChange={(e) => setEditMaxPerCard(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="voting-settings-actions">
                                <button 
                                    className="voting-settings-cancel"
                                    onClick={() => setShowVotingSettings(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="voting-settings-save"
                                    onClick={handleSaveVotingSettings}
                                >
                                    Save
                                </button>
                            </div>
                            <div className="voting-settings-divider"></div>
                            {currentVotingRound ? (
                                <div className="voting-btn-group">
                                    <button 
                                        className="voting-stop-btn"
                                        onClick={() => {
                                            onStopVoting();
                                            setShowVotingSettings(false);
                                        }}
                                    >
                                        Stop Voting
                                    </button>
                                    <button 
                                        className="voting-start-btn"
                                        onClick={() => {
                                            onStartVoting();
                                            setShowVotingSettings(false);
                                        }}
                                    >
                                        New Round
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="voting-start-btn"
                                    onClick={() => {
                                        onStartVoting();
                                        setShowVotingSettings(false);
                                    }}
                                >
                                    Start Voting
                                </button>
                            )}
                            <button 
                                className="voting-reset-link"
                                onClick={() => {
                                    onResetRounds();
                                    setShowVotingSettings(false);
                                }}
                            >
                                <span className="material-icons">refresh</span>
                                Reset All Votes
                                </button>
                            </div>
                        )}
                    </div>
                )}

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
                                <button 
                                    className="team-dropdown-close"
                                    onClick={() => setShowTeamSettings(false)}
                                    title="Close"
                                >
                                    <span className="material-icons">close</span>
                                </button>
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
                                                <span className='remove-text'>Remove</span>
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

                {/* Board Permissions Section - Only for facilitators */}
                {isFacilitator && (
                    <div className="permissions-section" ref={permissionsRef}>
                        <button 
                            className="permissions-btn"
                            onClick={() => setShowPermissions(!showPermissions)}
                            title="Board Permissions"
                        >
                            <span className="material-icons">admin_panel_settings</span>
                            <span className="permissions-btn-text">Permissions</span>
                        </button>

                        {showPermissions && (
                            <div className="permissions-dropdown">
                                <button 
                                    className="permissions-dropdown-close"
                                    onClick={() => setShowPermissions(false)}
                                    title="Close"
                                >
                                    <span className="material-icons">close</span>
                                </button>

                                {/* Facilitators Section */}
                                <div className="permissions-section-block">
                                    <h4>
                                        <span className="material-icons">star</span>
                                        Facilitators
                                    </h4>
                                    <p className="permissions-hint">Facilitators have full control over the board.</p>
                                    <ul className="facilitators-list">
                                        {boardData?.facilitators?.map((facilitator) => (
                                            <li key={facilitator.id}>
                                                <div className="facilitator-info">
                                                    <Avatar initials={facilitator.initials} userId={facilitator.id} size={24} />
                                                    <span>{facilitator.username}</span>
                                                    {facilitator.is_creator && (
                                                        <span className="creator-badge">Creator</span>
                                                    )}
                                                </div>
                                                {!facilitator.is_creator && (
                                                    <button
                                                        className="remove-facilitator-btn"
                                                        onClick={() => handleRemoveFacilitator(facilitator.id, facilitator.username, facilitator.is_creator)}
                                                        title="Remove facilitator"
                                                    >
                                                        <span className="material-icons">close</span>
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Add facilitator form - only show if there are team members who aren't facilitators */}
                                    {teamDetails?.members?.some(m => 
                                        !boardData?.facilitators?.find(f => f.id === m.id)
                                    ) && (
                                        <>
                                            <div className="add-facilitator-form">
                                                <input
                                                    type="text"
                                                    placeholder="Username"
                                                    value={newFacilitatorUsername}
                                                    onChange={(e) => setNewFacilitatorUsername(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFacilitator()}
                                                    list="team-members-list"
                                                />
                                                <datalist id="team-members-list">
                                                    {teamDetails?.members
                                                        ?.filter(m => !boardData?.facilitators?.find(f => f.id === m.id))
                                                        .map(m => (
                                                            <option key={m.id} value={m.username} />
                                                        ))
                                                    }
                                                </datalist>
                                                <button
                                                    onClick={handleAddFacilitator}
                                                    disabled={addFacilitatorLoading || !newFacilitatorUsername.trim()}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {addFacilitatorError && (
                                                <p className="add-facilitator-error">{addFacilitatorError}</p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="permissions-divider" />

                                {/* Participant Permissions Section */}
                                <div className="permissions-section-block">
                                    <h4>
                                        <span className="material-icons">people</span>
                                        Participant Permissions
                                    </h4>
                                    <p className="permissions-hint">Control what non-facilitators can do.</p>

                                    <div className="permission-toggles">
                                        <label className="permission-toggle">
                                            <input
                                                type="checkbox"
                                                checked={permissionToggles.participants_can_edit_columns}
                                                onChange={() => handlePermissionToggle('participants_can_edit_columns')}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span className="toggle-label">Can edit columns</span>
                                        </label>

                                        <label className="permission-toggle">
                                            <input
                                                type="checkbox"
                                                checked={permissionToggles.participants_can_edit_board_title}
                                                onChange={() => handlePermissionToggle('participants_can_edit_board_title')}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span className="toggle-label">Can edit board title</span>
                                        </label>

                                        <label className="permission-toggle">
                                            <input
                                                type="checkbox"
                                                checked={permissionToggles.participants_can_delete_any_card}
                                                onChange={() => handlePermissionToggle('participants_can_delete_any_card')}
                                            />
                                            <span className="toggle-slider"></span>
                                            <span className="toggle-label">Can delete any card</span>
                                        </label>
                                    </div>
                                </div>
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
                            {isFacilitator && (
                                <>
                                    <button 
                                        className={`toggle-status-btn ${boardData?.is_active ? 'unlocked' : 'locked'}`}
                                        onClick={handleToggleActive}
                                        disabled={isToggling}
                                        title={boardData?.is_active ? 'Close board' : 'Reopen board'}
                                    >
                                        <span className="material-icons">
                                            {boardData?.is_active ? 'lock_open' : 'lock'}
                                        </span>
                                    </button>
                                    <button 
                                        className="delete-board-btn" 
                                        onClick={handleDeleteBoard}
                                        title="Delete board"
                                    >
                                        <span className="material-icons">delete</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Controls Button - rightmost */}
                <div className="mobile-action-buttons">
                    {onAddColumn && canEditColumns && (
                        <button 
                            className="add-column-btn mobile-only"
                            onClick={onAddColumn}
                            title="Add new column"
                        >
                            <span className="material-icons">add</span>
                            <span className="add-column-text">Column</span>
                        </button>
                    )}
                    {mobileControls}
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