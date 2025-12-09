import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useToast } from '../ToastProvider';
import { useConfirm } from '../ConfirmProvider';
import createActionItem from '../../api/create-action-item';
import patchActionItem from '../../api/patch-action-item';
import deleteActionItem from '../../api/delete-action-item';
import patchBoard from '../../api/patch-board';
import deleteBoard from '../../api/delete-board';
import Avatar from '../Avatar';
import './BoardPanel.css';

const BASE_URL = import.meta.env.VITE_API_URL;

function BoardPanel({ 
    // Action Items props
    actionItems = [], 
    teamMembers = [],
    boardId,
    onActionItemCreate,
    onActionItemUpdate,
    onActionItemDelete,
    // Control Panel props
    dragState,
    isCreatingCard,
    onDragStart,
    onDragEnd,
    onAddColumn,
    currentVotingRound,
    remainingVotes,
    maxVotesPerRound,
    maxVotesPerCard,
    onVotingSettingsChange,
    onStartVoting,
    isBoardCreator,
    // Board management props
    boardTitle,
    isActive,
    onBoardStatusChange,
    onBoardDelete,
    // Report props
    onShowReport,
    // Mobile state - controlled by parent
    isMobileOpen = false,
    onMobileClose,
    // Mobile only mode - hide on desktop
    mobileOnly = false,
}) {
    const { auth } = useAuth();
    const { showToast } = useToast(); 
    const { confirm } = useConfirm();
    const panelRef = useRef(null);
    
    // Panel state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'settings'
    
    // Action items state
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState({});
    const [newItemText, setNewItemText] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Close dropdown when clicking outside (mobile)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMobileOpen &&
                panelRef.current &&
                !panelRef.current.contains(event.target) &&
                !event.target.closest('.board-panel__mobile-btn')
            ) {
                onMobileClose?.();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileOpen, onMobileClose]);

    const statusOptions = [
        { value: 'todo', label: 'To Do', color: '#d8b4fe' },
        { value: 'in_progress', label: 'In Progress', color: '#c4b5fd' },
        { value: 'completed', label: 'Completed', color: '#a78bfa' }
    ];

    // Action Item handlers
    const handleStatusChange = async (actionItemId, newStatus) => {
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            const updated = await patchActionItem(actionItemId, { status: newStatus }, auth.token);
            onActionItemUpdate(updated);
        } catch (error) {
            console.error('Failed to update status:', error);
            showToast(`Failed to update status: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionItemId]: false }));
        }
    };

    const handleAssigneeChange = async (actionItemId, username) => {
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            const updated = await patchActionItem(
                actionItemId, 
                { assignee_username: username || null }, 
                auth.token
            );
            onActionItemUpdate(updated);
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update assignee:', error);
            showToast(`Failed to update assignee: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionItemId]: false }));
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        if (!newItemText.trim() || isCreating) return;

        setIsCreating(true);
        try {
            const newItem = await createActionItem(boardId, newItemText.trim(), auth.token);
            onActionItemCreate(newItem);
            setNewItemText('');
        } catch (error) {
            console.error('Failed to create action item:', error);
            showToast(`Failed to create action item: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (actionItemId) => {
        const confirmDelete = await confirm({
            title: 'Delete Action Item',
            message: 'Are you sure you want to delete this action item?'
        });

        if (!confirmDelete) return;
        
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            await deleteActionItem(actionItemId, auth.token);
            onActionItemDelete(actionItemId);
        } catch (error) {
            console.error('Failed to delete action item:', error);
            showToast(`Failed to delete: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionItemId]: false }));
        }
    };

    const getStatusStyle = (status) => {
        const option = statusOptions.find(s => s.value === status);
        return option ? { backgroundColor: option.color } : {};
    };

    // Settings handlers
    const handleExportCSV = async () => {
        if (!boardId || !auth.token) {
            showToast('Unable to export - missing board info');
            return;
        }
        
        try {
            const response = await fetch(
                `${BASE_URL}/api/retro-boards/${boardId}/report/?format=csv`,
                {
                    headers: {
                        Authorization: auth.token,
                    },
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to download report');
            }
            
            // Get the blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `board_${boardId}_report.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            showToast('CSV report downloaded!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showToast('Failed to download CSV report');
        }
    };

    const handleViewReports = () => {
        if (onShowReport) {
            onShowReport();
        }
    };

    // Board management handlers
    const handleToggleStatus = async () => {
        const newStatus = !isActive;
        const action = isActive ? 'close' : 'reopen';
        const confirmed = await confirm({
            title: `${isActive ? 'Close' : 'Reopen'} Board`,
            message: `Are you sure you want to ${action} this board?${isActive ? ' Team members won\'t be able to add new cards.' : ''}`
        });
        
        if (!confirmed) return;
        
        try {
            await patchBoard(boardId, { is_active: newStatus }, auth.token);
            if (onBoardStatusChange) {
                onBoardStatusChange(newStatus);
            }
            showToast(`Board ${action}d successfully`, 'success');
        } catch (error) {
            console.error('Failed to update board status:', error);
            showToast(`Failed to ${action} board: ${error.message}`, 'error');
        }
    };

    const handleDeleteBoard = async () => {
        const confirmed = await confirm({
            title: 'Delete Board',
            message: `Are you sure you want to delete "${boardTitle}"? This action cannot be undone and all cards will be permanently lost.`
        });
        
        if (!confirmed) return;
        
        try {
            await deleteBoard(boardId, auth.token);
            if (onBoardDelete) {
                onBoardDelete();
            }
        } catch (error) {
            console.error('Failed to delete board:', error);
            showToast(`Failed to delete board: ${error.message}`, 'error');
        }
    };

    // Shared content for both desktop and mobile
    const panelContent = (
        <div className="board-panel__content">
            {/* Header with Tabs */}
            <div className="board-panel__header">
                <div className="board-panel__tabs">
                    <button 
                        className={`board-panel__tab ${activeTab === 'actions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('actions')}
                    >
                        <span className="material-icons">task_alt</span>
                        Actions
                        {actionItems.length > 0 && (
                            <span className="board-panel__tab-count">{actionItems.length}</span>
                        )}
                    </button>
                    <button 
                        className={`board-panel__tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span className="material-icons">settings</span>
                        Settings
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="board-panel__body">
                {activeTab === 'actions' && (
                    <div className="board-panel__actions-tab">
                        {/* Add New Action Item */}
                        <div className="board-panel__form">
                            <input
                                type="text"
                                className="board-panel__input"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateItem(e)}
                                placeholder="Add action item..."
                                disabled={isCreating}
                            />
                            <button 
                                type="button"
                                className="board-panel__submit-btn"
                                onClick={handleCreateItem}
                                disabled={!newItemText.trim() || isCreating}
                                title="Add action item"
                            >
                                <span className="material-icons">add</span>
                            </button>
                        </div>

                        {/* Action Items List */}
                        <div className="board-panel__list">
                            {actionItems.length === 0 ? (
                                <p className="board-panel__empty">No action items yet. Add one above!</p>
                            ) : (
                                actionItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`board-panel__item ${loading[item.id] ? 'board-panel__item--loading' : ''}`}
                                    >
                                        <div className="board-panel__item-content">
                                            {item.content}
                                        </div>

                                        <div className="board-panel__item-meta">
                                            {/* Status Dropdown */}
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className="board-panel__status-select"
                                                style={getStatusStyle(item.status)}
                                                disabled={loading[item.id]}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Assignee */}
                                            <div className="board-panel__assignee">
                                                {editingId === item.id ? (
                                                    <select
                                                        value={item.assignee?.username || ''}
                                                        onChange={(e) => handleAssigneeChange(item.id, e.target.value)}
                                                        onBlur={() => setEditingId(null)}
                                                        autoFocus
                                                        className="board-panel__assignee-select"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {teamMembers.map(member => (
                                                            <option key={member.id} value={member.username}>
                                                                {member.username}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <button 
                                                        className="board-panel__assignee-btn"
                                                        onClick={() => setEditingId(item.id)}
                                                        title={item.assignee ? item.assignee.username : 'Assign someone'}
                                                    >
                                                        {item.assignee ? (
                                                            <Avatar initials={item.assignee.initials} userId={item.assignee.id} size={24} />
                                                        ) : (
                                                            <span className="material-icons">person_add</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="board-panel__item-actions">
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                disabled={loading[item.id]}
                                                title="Delete action"
                                                className="board-panel__delete-btn"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="board-panel__settings-tab">
                        {/* Voting Section - Desktop only */}
                        <div className="board-panel__section board-panel__section--desktop-only">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">how_to_vote</span>
                                Voting
                            </h4>
                            {currentVotingRound ? (
                                <div className="board-panel__voting-info">
                                    <div className="board-panel__voting-round">
                                        Round {currentVotingRound?.round_number ?? (typeof currentVotingRound === 'number' ? currentVotingRound : 1)}
                                    </div>
                                    <div className="board-panel__votes-remaining">
                                        <span className="votes-count">{remainingVotes ?? maxVotesPerRound ?? 5}</span>
                                        <span className="votes-label">/ {maxVotesPerRound ?? 5} votes left</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="board-panel__voting-info">
                                    <div className="board-panel__voting-status">
                                        Voting not started
                                    </div>
                                </div>
                            )}
                            {isBoardCreator && (
                                <button 
                                    className="board-panel__btn board-panel__btn--accent"
                                    onClick={onStartVoting}
                                    title={currentVotingRound ? "Start a new voting round - everyone gets fresh votes!" : "Start voting for this board"}
                                >
                                    <span className="material-icons">{currentVotingRound ? 'restart_alt' : 'play_arrow'}</span>
                                    {currentVotingRound ? `Start Round ${(currentVotingRound?.round_number ?? (typeof currentVotingRound === 'number' ? currentVotingRound : 1)) + 1}` : 'Start Voting'}
                                </button>
                            )}
                        </div>

                        {/* Add Cards Section - Hidden on mobile */}
                        <div className="board-panel__section board-panel__section--desktop-only">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">note_add</span>
                                Add Cards
                            </h4>
                            <div className="board-panel__card-area">
                                <DraggableCard
                                    isDragging={dragState.isDragging}
                                    isCreatingCard={isCreatingCard}
                                    onDragStart={() => onDragStart('generic')}
                                    onDragEnd={onDragEnd}
                                />
                                <div className="board-panel__card-hint">
                                    {isCreatingCard ? (
                                        <span className="hint--creating">Creating card...</span>
                                    ) : dragState.isDragging ? (
                                        <span className="hint--dragging">Drop into a column</span>
                                    ) : (
                                        <span className="hint--idle">Drag to any column</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columns Section - Desktop only (Add Column is in header on mobile) */}
                        <div className="board-panel__section board-panel__section--desktop-only">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">view_column</span>
                                Columns
                            </h4>
                            <button 
                                className="board-panel__btn board-panel__btn--primary"
                                onClick={onAddColumn}
                            >
                                <span className="material-icons">add</span>
                                Add Column
                            </button>
                        </div>

                        {/* Reports Section */}
                        <div className="board-panel__section">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">analytics</span>
                                Reports
                            </h4>
                            <div className="board-panel__btn-group">
                                <button 
                                    className="board-panel__btn board-panel__btn--accent"
                                    onClick={handleViewReports}
                                    title="View detailed reports"
                                >
                                    <span className="material-icons">analytics</span>
                                    Reports
                                </button>
                            </div>
                        </div>

                        {/* Board Status Section */}
                        <div className="board-panel__section">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">{isActive ? 'lock_open' : 'lock'}</span>
                                Board Status
                            </h4>
                            <div className="board-panel__status-info">
                                <span className={`board-panel__status-badge ${isActive ? 'active' : 'closed'}`}>
                                    {isActive ? 'Open' : 'Closed'}
                                </span>
                                <span className="board-panel__status-hint">
                                    {isActive 
                                        ? 'Team members can add and edit cards' 
                                        : 'Board is locked for editing'}
                                </span>
                            </div>
                            <button 
                                className={`board-panel__btn ${isActive ? 'board-panel__btn--primary' : 'board-panel__btn--primary'}`}
                                onClick={handleToggleStatus}
                            >
                                <span className="material-icons">{isActive ? 'lock' : 'lock_open'}</span>
                                {isActive ? 'Close Board' : 'Reopen Board'}
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="board-panel__section board-panel__section--danger">
                            <h4 className="board-panel__section-title">
                                <span className="material-icons">warning</span>
                                Danger Zone
                            </h4>
                            <p className="board-panel__danger-hint">
                                Once deleted, this board cannot be recovered.
                            </p>
                            <button 
                                className="board-panel__btn board-panel__btn--danger"
                                onClick={handleDeleteBoard}
                            >
                                <span className="material-icons">delete_forever</span>
                                Delete Board
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop: Side panel - only if not mobileOnly */}
            {!mobileOnly && (
                <div className={`board-panel board-panel--desktop ${isCollapsed ? 'collapsed' : ''}`}>
                    {/* Toggle Button */}
                    <button 
                        className="board-panel__toggle"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? 'Show Panel' : 'Hide Panel'}
                    >
                        <span className="material-icons">
                            {isCollapsed ? 'chevron_left' : 'chevron_right'}
                        </span>
                        {isCollapsed && actionItems.length > 0 && (
                            <span className="board-panel__badge">{actionItems.length}</span>
                        )}
                    </button>

                    {!isCollapsed && panelContent}
                </div>
            )}

            {/* Mobile: Dropdown only - button is rendered in BoardHeader */}
            {isMobileOpen && (
                <div className="board-panel--mobile" ref={panelRef}>
                    <div className="board-panel__mobile-dropdown">
                        {panelContent}
                        <button 
                            className="board-panel__mobile-close"
                            onClick={onMobileClose}
                            title="Close panel"
                        >
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// Draggable card component
function DraggableCard({ isDragging, isCreatingCard, onDragStart, onDragEnd }) {
    const handleDragStart = (event) => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', 'generic');
        onDragStart();
    };

    return (
        <div
            draggable={!isCreatingCard}
            className={`board-panel__draggable-card ${isCreatingCard ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            title="Drag me to any column to add a new card"
        >
            <span className="material-icons">note_add</span>
        </div>
    );
}

export default BoardPanel;
