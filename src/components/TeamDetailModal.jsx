import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { useToast } from './ToastProvider';
import getTeam from '../api/get-team';
import getTeamBoards from '../api/get-team-boards';
import addTeamMember from '../api/add-team-member';
import deleteTeamMember from '../api/delete-team-member';
import deleteTeam from '../api/delete-team';
import ProfileModal from './ProfileModal';
import Avatar from './Avatar';
import './TeamDetailModal.css';

function TeamDetailModal({ isOpen, onClose, teamId, teamName }) {
    // React hooks
    const [teamDetails, setTeamDetails] = useState(null);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);

    // Router hooks
    const navigate = useNavigate();

    // Context hooks
    const { auth } = useAuth();
    const { showToast } = useToast();

    // Add member state
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [addMemberError, setAddMemberError] = useState('');

    useEffect(() => {
        async function fetchTeamData() {
            if (!isOpen || !teamId || !auth?.token) return;

            setLoading(true);
            setError('');

            try {
                const [details, teamBoards] = await Promise.all([
                    getTeam(teamId, auth.token),
                    getTeamBoards(teamId, auth.token)
                ]);
                setTeamDetails(details);
                setBoards(teamBoards);
            } catch (err) {
                console.error('Failed to fetch team data:', err);
                setError('Failed to load team details');
            } finally {
                setLoading(false);
            }
        }

        fetchTeamData();
    }, [isOpen, teamId, auth?.token]);

    const handleAddMember = async () => {
        if (!newMemberUsername.trim()) return;

        setAddMemberLoading(true);
        setAddMemberError('');

        try {
            await addTeamMember(teamId, newMemberUsername.trim(), auth.token);
            const details = await getTeam(teamId, auth.token);
            setTeamDetails(details);
            setNewMemberUsername('');
        } catch (err) {
            console.error('Failed to add member:', err);
            setAddMemberError(err.message || 'Failed to add member');
        } finally {
            setAddMemberLoading(false);
        }
    };

    const handleRemoveMember = async (userId, username) => {
        const confirmRemove = window.confirm(
            `Are you sure you want to remove "${username}" from this team?`
        );

        if (!confirmRemove) return;

        try {
            await deleteTeamMember(teamId, userId, auth.token);
            const details = await getTeam(teamId, auth.token);
            setTeamDetails(details);
        } catch (err) {
            console.error('Failed to remove member:', err);
            showToast(`Failed to remove member: ${err.message}`);
        }
    };

    const handleDeleteTeam = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${teamName}"? This action cannot be undone.`
        );

        if (!confirmDelete) return;

        try {
            await deleteTeam(teamId, auth.token);
            onClose();
            window.location.reload();
        } catch (err) {
            console.error('Failed to delete team:', err);
            showToast(`Failed to delete team: ${err.message}`);
        }
    };

    const handleOpenBoard = (boardId) => {
        onClose();
        navigate(`/retro-board/${boardId}`);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="team-detail-overlay" onClick={onClose}>
            <div className="team-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="team-detail-header">
                    <h2>{teamName}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="team-detail-content">
                    {loading && <p className="loading-text">Loading...</p>}
                    {error && <p className="error-text">{error}</p>}

                    {!loading && !error && (
                        <>
                            {/* Members Section */}
                            <section className="team-detail-section">
                                <h3>Members</h3>
                                <ul className="team-members-list">
                                    {teamDetails?.members?.map((member) => (
                                        <li key={member.id} className="team-member-item">
                                            <span 
                                                className="member-name-link"
                                                onClick={() => setSelectedMember(member)}
                                            >
                                                <Avatar initials={member.initials} size={24} />
                                                {member.username}
                                            </span>
                                            {member.id !== auth.user.id && (
                                                <button
                                                    className="remove-member-btn"
                                                    onClick={() => handleRemoveMember(member.id, member.username)}
                                                    title="Remove member"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                <div className="add-member-form">
                                    <input
                                        type="text"
                                        placeholder="Add member by username"
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
                            </section>

                            {/* Boards Section */}
                            <section className="team-detail-section">
                                <h3>Boards</h3>
                                {boards.length === 0 ? (
                                    <p className="no-boards-text">No boards yet</p>
                                ) : (
                                    <ul className="team-boards-list">
                                        {boards.map((board) => (
                                            <li key={board.id} className="team-board-item">
                                                <div className="board-info">
                                                    <span className="board-title">{board.title}</span>
                                                    <span className="board-date">{formatDate(board.created_at)}</span>
                                                </div>
                                                <button
                                                    className="btn btn-small btn-primary"
                                                    onClick={() => handleOpenBoard(board.id)}
                                                >
                                                    Open
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            {/* Actions */}
                            <section className="team-detail-actions">
                                <button
                                    className="btn btn-save"
                                    onClick={onClose}
                                >
                                    Save Team
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteTeam}
                                >
                                    Delete Team
                                </button>
                            </section>
                        </>
                    )}
                </div>
            </div>

            {/* Member Profile Modal */}
            <ProfileModal
                isOpen={!!selectedMember}
                onClose={() => setSelectedMember(null)}
                userId={selectedMember?.id}
                username={selectedMember?.username}
            />
        </div>
    );
}

export default TeamDetailModal;
