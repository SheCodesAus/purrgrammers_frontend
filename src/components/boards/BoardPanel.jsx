import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useToast } from '../ToastProvider';
import { useConfirm } from '../ConfirmProvider';
import createActionItem from '../../api/create-action-item';
import patchActionItem from '../../api/patch-action-item';
import deleteActionItem from '../../api/delete-action-item';
import Avatar from '../Avatar';
import './BoardPanel.css';

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
    maxVotes,
    onStartNewRound,
}) {
    const { auth } = useAuth();
    const { showToast } = useToast(); 
    const { confirm } = useConfirm();
    
    // Panel state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('actions'); // 'actions' | 'settings'
    
    // Action items state
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState({});
    const [newItemText, setNewItemText] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const statusOptions = [
        { value: 'todo', label: 'To Do', color: '#6b7280' },
        { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
        { value: 'completed', label: 'Completed', color: '#22c55e' }
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
    const handleExport = (format) => {
        showToast(`Export to ${format.toUpperCase()} coming soon!`);
    };

    const handleViewReports = () => {
        showToast('Reports page coming soon!');
    };

    return (
        <div className={`board-panel ${isCollapsed ? 'collapsed' : ''}`}>
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

            {!isCollapsed && (
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
                                {/* Voting Section */}
                                <div className="board-panel__section">
                                    <h4 className="board-panel__section-title">
                                        <span className="material-icons">how_to_vote</span>
                                        Voting
                                    </h4>
                                    <div className="board-panel__voting-info">
                                        <div className="board-panel__voting-round">
                                            Round {currentVotingRound?.round_number ?? currentVotingRound ?? 1}
                                        </div>
                                        <div className="board-panel__votes-remaining">
                                            <span className="votes-count">{remainingVotes ?? maxVotes ?? 5}</span>
                                            <span className="votes-label">/ {maxVotes ?? 5} votes left</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="board-panel__btn board-panel__btn--accent"
                                        onClick={onStartNewRound}
                                        title="Start a new voting round - everyone gets fresh votes!"
                                    >
                                        <span className="material-icons">restart_alt</span>
                                        New Round
                                    </button>
                                </div>

                                {/* Add Cards Section */}
                                <div className="board-panel__section">
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

                                {/* Columns Section */}
                                <div className="board-panel__section">
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
                                            className="board-panel__btn board-panel__btn--secondary"
                                            onClick={() => handleExport('csv')}
                                            title="Export board data as CSV"
                                        >
                                            <span className="material-icons">download</span>
                                            CSV
                                        </button>
                                        <button 
                                            className="board-panel__btn board-panel__btn--secondary"
                                            onClick={() => handleExport('pdf')}
                                            title="Export board as PDF"
                                        >
                                            <span className="material-icons">picture_as_pdf</span>
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
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
