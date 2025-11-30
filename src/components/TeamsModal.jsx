import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import getTeams from '../api/get-teams';
import getTeam from '../api/get-team';
import createTeam from '../api/create-team';
import addTeamMember from '../api/add-team-member';
import './TeamsModal.css';

function TeamsModal({ isOpen, onClose }) {
    const { auth } = useAuth();
    const [teams, setTeams] = useState([]);
    const [expandedTeamId, setExpandedTeamId] = useState(null);
    const [teamDetails, setTeamDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create team state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [createLoading, setCreateLoading] = useState(false);

    // Add member state
    const [newMemberUsername, setNewMemberUsername] = useState('');
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [addMemberError, setAddMemberError] = useState('');

    // Fetch teams when modal opens
    useEffect(() => {
        if (isOpen && auth.token) {
            fetchTeams();
        }
    }, [isOpen, auth.token]);

    const fetchTeams = async () => {
        setLoading(true);
        setError('');
        try {
            const teamsData = await getTeams(auth.token);
            setTeams(teamsData);
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setError('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    const handleExpandTeam = async (teamId) => {
        if (expandedTeamId === teamId) {
            setExpandedTeamId(null);
            return;
        }
        
        setExpandedTeamId(teamId);
        
        // Fetch team details if not already loaded
        if (!teamDetails[teamId]) {
            try {
                const details = await getTeam(teamId, auth.token);
                setTeamDetails(prev => ({ ...prev, [teamId]: details }));
            } catch (err) {
                console.error("Failed to fetch team details:", err);
            }
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        
        setCreateLoading(true);
        try {
            await createTeam({ name: newTeamName.trim() }, auth.token);
            setNewTeamName('');
            setShowCreateForm(false);
            fetchTeams(); // Refresh the list
        } catch (err) {
            console.error("Failed to create team:", err);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleAddMember = async (teamId) => {
        if (!newMemberUsername.trim()) return;
        
        setAddMemberLoading(true);
        setAddMemberError('');
        
        try {
            await addTeamMember(teamId, newMemberUsername.trim(), auth.token);
            // Refresh team details
            const details = await getTeam(teamId, auth.token);
            setTeamDetails(prev => ({ ...prev, [teamId]: details }));
            setNewMemberUsername('');
        } catch (err) {
            console.error("Failed to add team member:", err);
            setAddMemberError(err.message);
        } finally {
            setAddMemberLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="teams-modal-overlay" onClick={onClose}>
            <div className="teams-modal" onClick={(e) => e.stopPropagation()}>
                <div className="teams-modal-header">
                    <h2>My Teams</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="teams-modal-content">
                    {loading && <p>Loading teams...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && !error && (
                        <>
                            <ul className="teams-list">
                                {teams.map((team) => (
                                    <li key={team.id} className="team-item">
                                        <button 
                                            className="team-header-btn"
                                            onClick={() => handleExpandTeam(team.id)}
                                        >
                                            <span>{team.name}</span>
                                            <span className="expand-icon">
                                                {expandedTeamId === team.id ? '▼' : '▶'}
                                            </span>
                                        </button>

                                        {expandedTeamId === team.id && (
                                            <div className="team-details">
                                                <h4>Members</h4>
                                                <ul className="members-list">
                                                    {teamDetails[team.id]?.members?.map((member) => (
                                                        <li key={member.id}>{member.username}</li>
                                                    ))}
                                                </ul>

                                                <div className="add-member-form">
                                                    <input
                                                        type="text"
                                                        placeholder="Username"
                                                        value={newMemberUsername}
                                                        onChange={(e) => setNewMemberUsername(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddMember(team.id)}
                                                    />
                                                    <button 
                                                        onClick={() => handleAddMember(team.id)}
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
                                    </li>
                                ))}
                            </ul>

                            {teams.length === 0 && (
                                <p className="no-teams">You're not part of any teams yet.</p>
                            )}

                            {/* Create Team Section */}
                            {!showCreateForm ? (
                                <button 
                                    className="create-team-btn"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    + Create New Team
                                </button>
                            ) : (
                                <div className="create-team-form">
                                    <input
                                        type="text"
                                        placeholder="Team name"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                                    />
                                    <button 
                                        onClick={handleCreateTeam}
                                        disabled={createLoading || !newTeamName.trim()}
                                    >
                                        {createLoading ? 'Creating...' : 'Create'}
                                    </button>
                                    <button 
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setNewTeamName('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TeamsModal;