import { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import patchActionItem from '../../api/patch-action-item';
import deleteActionItem from '../../api/delete-action-item';
import returnToColumn from '../../api/return-to-column';
import Avatar from '../Avatar';
import './ActionBar.css';

function ActionBar({ 
    actionItems = [], 
    teamMembers = [],
    isCollapsed, 
    onToggleCollapse,
    onActionItemUpdate,
    onActionItemDelete,
    onCardReturn,
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop
}) {
    const { auth } = useAuth();
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState({});

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

    const handleReturnToColumn = async (actionItemId) => {
        if (!window.confirm('Return this action item to its original column?')) return;
        
        setLoading(prev => ({ ...prev, [actionItemId]: true }));
        try {
            const result = await returnToColumn(actionItemId, auth.token);
            onCardReturn(result);
        } catch (error) {
            console.error('Failed to return to column:', error);
            alert(`Failed to return to column: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionItemId]: false }));
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

                    {/* Drop Zone */}
                    <div 
                        className={`action-bar-dropzone ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        <span className="material-icons">add_circle_outline</span>
                        <span>Drop card here to create action</span>
                    </div>

                    {/* Action Items List */}
                    <div className="action-items-list">
                        {actionItems.length === 0 ? (
                            <p className="no-actions">No action items yet. Drag cards here to create actions.</p>
                        ) : (
                            actionItems.map(item => (
                                <div 
                                    key={item.id} 
                                    className={`action-item ${loading[item.id] ? 'loading' : ''}`}
                                >
                                    <div className="action-item-content">
                                        {item.content}
                                    </div>

                                    <div className="action-item-meta">
                                        {/* Status Dropdown */}
                                        <select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            className="status-select"
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
                                        <div className="assignee-section">
                                            {editingId === item.id ? (
                                                <select
                                                    value={item.assignee?.username || ''}
                                                    onChange={(e) => handleAssigneeChange(item.id, e.target.value)}
                                                    onBlur={() => setEditingId(null)}
                                                    autoFocus
                                                    className="assignee-select"
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
                                                    className="assignee-btn"
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
                                    <div className="action-item-actions">
                                        <button
                                            onClick={() => handleReturnToColumn(item.id)}
                                            disabled={loading[item.id]}
                                            title="Return to column"
                                            className="action-btn return-btn"
                                        >
                                            <span className="material-icons">undo</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            disabled={loading[item.id]}
                                            title="Delete action"
                                            className="action-btn delete-btn"
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
