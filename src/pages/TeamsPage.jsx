import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import getTeams from "../api/get-teams";
import "./TeamsPage.css";

function TeamsPage() {
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [teamsState, setTeamsState] = useState({
        data: [],
        isLoading: true,
        error: ""
    });

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    useEffect(() => {
        async function fetchTeams() {
            if (!auth?.token) {
                setTeamsState({
                    data: [],
                    isLoading: false,
                    error: "Please log in to view teams"
                });
                return;
            }

            try {
                setTeamsState(prev => ({ ...prev, isLoading: true }));
                const teams = await getTeams(auth.token);
                setTeamsState({
                    data: teams,
                    isLoading: false,
                    error: ""
                });
            } catch (error) {
                setTeamsState({
                    data: [],
                    isLoading: false,
                    error: error.message
                });
            }
        }

        fetchTeams();
    }, [auth?.token]);

    function handleCreateTeam() {
        setShowCreateForm(true);
        setShowJoinForm(false);
    }

    function handleJoinTeam() {
        setShowJoinForm(true);
        setShowCreateForm(false);
    }

    function handleTeamCreated(newTeam) {
        setTeamsState(prev => ({
            ...prev,
            data: [...prev.data, newTeam]
        }));
        setShowCreateForm(false);
    }

    function handleTeamJoined(joinedTeam) {
        setTeamsState(prev => ({
            ...prev,
            data: [...prev.data, joinedTeam]
        }));
        setShowJoinForm(false);
    }

    function handleCancelForms() {
        setShowCreateForm(false);
        setShowJoinForm(false);
    }

    if (teamsState.isLoading) {
        return (
            <div className="teams-page">
                <div className="loading-container">
                    <p>Loading teams...</p>
                </div>
            </div>
        );
    }

    if (teamsState.error) {
        return (
            <div className="teams-page">
                <div className="error-container">
                    <p className="error">{teamsState.error}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="teams-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>My Teams</h1>
                    <p>Manage your teams and collaborate on retro boards</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={handleJoinTeam}
                        disabled={showJoinForm}
                    >
                        Join Team
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={handleCreateTeam}
                        disabled={showCreateForm}
                    >
                        Create Team
                    </button>
                </div>
            </header>

            <main className="teams-container">
                {(showCreateForm || showJoinForm) && (
                    <div className="forms-section">
                        {showCreateForm && (
                            <div className="form-container">
                                <h3>Create New Team</h3>
                                {/* TODO: CreateTeamForm component */}
                                <div className="temp-form">
                                    <p>Create team form will go here</p>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={handleCancelForms}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {showJoinForm && (
                            <div className="form-container">
                                <h3>Join Existing Team</h3>
                                {/* TODO: JoinTeamForm component */}
                                <div className="temp-form">
                                    <p>Join team form will go here</p>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={handleCancelForms}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="teams-grid">
                    {teamsState.data.length === 0 ? (
                        <div className="empty-state">
                            <h3>No teams yet</h3>
                            <p>Create your first team or join an existing one to get started!</p>
                        </div>
                    ) : (
                        teamsState.data.map(team => (
                            <div key={team.id} className="team-card">
                                <h4 className="team-name">{team.name}</h4>
                                <p className="team-description">{team.description || "No description"}</p>
                                <div className="team-meta">
                                    <span className="member-count">
                                        {team.member_count || 0} members
                                    </span>
                                    <span className="board-count">
                                        {team.board_count || 0} boards
                                    </span>
                                </div>
                                <div className="team-actions">
                                    <button 
                                        className="btn btn-primary btn-small"
                                        onClick={() => navigate(`/teams/${team.id}`)}
                                    >
                                        View Team
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <div className="page-footer">
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default TeamsPage;