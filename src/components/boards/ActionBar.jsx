import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import createActionItem from '../../api/create-action-item';
import patchActionItem from '../../api/patch-action-item';
import deleteActionItem from '../../api/delete-action-item';
import Avatar from '../Avatar';
import './ActionBar.css';

function ActionBar({ 
    actionItems = [], 
    teamMembers = [],
    boardId,
    isCollapsed, 
    onToggleCollapse,
    onActionItemCreate,
    onActionItemUpdate,
    onActionItemDelete
}) {
    const { auth } = useAuth();
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState({});
    const [newItemText, setNewItemText] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const statusOptions = [
        { value: 'todo', label: 'To Do', color: '#6b7280' },
        { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
        { value: 'completed', label: 'Completed', color: '#22c55e' }
    ];

    const handleStatusChange = async (actionItemId, newStatus) => {
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            const updated = await patchActionItem(actionItemId, { status: newStatus }, auth.token);
            onActionItemUpdate(updated);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(`Failed to update status: ${error.message}`);
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
            alert(`Failed to update assignee: ${error.message}`);
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
            alert(`Failed to create action item: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (actionItemId) => {
        if (!window.confirm('Delete this action item? This cannot be undone.')) return;
        
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            await deleteActionItem(actionItemId, auth.token);
            onActionItemDelete(actionItemId);
        } catch (error) {
            console.error('Failed to delete action item:', error);
            alert(`Failed to delete: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionItemId]: false }));
        }
    };

    const getStatusStyle = (status) => {
        const option = statusOptions.find(s => s.value === status);
        return option ? { backgroundColor: option.color } : {};
    };

    return (
        <div className={`action-bar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Toggle Button */}
            <button 
                className="action-bar-toggle"
                onClick={onToggleCollapse}
                title={isCollapsed ? 'Show Actions' : 'Hide Actions'}
            >
                <span className="material-icons">
                    {isCollapsed ? 'chevron_left' : 'chevron_right'}
                </span>
                {isCollapsed && <span className="action-bar-badge">{actionItems.length}</span>}
            </button>

            {!isCollapsed && (
                <div className="action-bar-content">
                    <div className="action-bar-header">
                        <h3>
                            <span className="material-icons">task_alt</span>
                            Action Items
                        </h3>
                        <span className="action-count">{actionItems.length}</span>
                    </div>

                    {/* Add New Action Item */}
                    <div className="action-bar__form">
                        <input
                            type="text"
                            className="action-bar__input"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateItem(e)}
                            placeholder="Add action item..."
                            disabled={isCreating}
                        />
                        <button 
                            type="button"
                            className="action-bar__submit-btn"
                            onClick={handleCreateItem}
                            disabled={!newItemText.trim() || isCreating}
                            title="Add action item"
                        >
                            <span className="material-icons">add</span>
                        </button>
                    </div>

                    {/* Action Items List */}
                    <div className="action-bar__list">
                        {actionItems.length === 0 ? (
                            <p className="action-bar__empty">No action items yet. Add one above!</p>
                        ) : (
                            actionItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className={`action-bar__item ${loading[item.id] ? 'action-bar__item--loading' : ''}`}
                                >
                                    <div className="action-bar__item-content">
                                        {item.content}
                                    </div>

                                    <div className="action-bar__item-meta">
                                        {/* Status Dropdown */}
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            className="action-bar__status-select"
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
                                        <div className="action-bar__assignee">
                                            {editingId === item.id ? (
                                                <select
                                                    value={item.assignee?.username || ''}
                                                    onChange={(e) => handleAssigneeChange(item.id, e.target.value)}
                                                    onBlur={() => setEditingId(null)}
                                                    autoFocus
                                                    className="action-bar__assignee-select"
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
                                                    className="action-bar__assignee-btn"
                                                    onClick={() => setEditingId(item.id)}
                                                    title={item.assignee ? item.assignee.username : 'Assign someone'}
                                                >
                                                    {item.assignee ? (
                                                        <Avatar initials={item.assignee.initials} size={24} />
                                                    ) : (
                                                        <span className="material-icons">person_add</span>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="action-bar__item-actions">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={loading[item.id]}
                                            title="Delete action"
                                            className="action-bar__delete-btn"
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
        </div>
    );
}

export default ActionBar;
