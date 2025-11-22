import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import getBoards from "../api/get-boards";
import getTeams from "../api/get-teams";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [teamsState, setTeamsState] = useState({
    data: [],
    isLoading: true,
    error: ""
  });

  const [boardsState, setBoardsState] = useState({
    data: [],
    isLoading: true,
    error: ""
  });

  useEffect(() => {
    async function fetchUserTeams() {
      if (!auth?.token) {
        setTeamsState({
          data: [],
          isLoading: false,
          error: ""
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

    async function fetchUserBoards() {
      if (!auth?.token) {
        setBoardsState({
          data: [],
          isLoading: false,
          error: ""
        });
        return;
      }

      try {
        setBoardsState(prev => ({ ...prev, isLoading: true }));
        const boards = await getBoards(auth.token);
        setBoardsState({
          data: boards,
          isLoading: false,
          error: ""
        });
      } catch (error) {
        setBoardsState({
          data: [],
          isLoading: false,
          error: error.message
        });
      }
    }

    async function fetchData() {
      fetchUserTeams();
      fetchUserBoards();
    }
    
    fetchData();
  }, [auth?.token]);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header-section">
        <h1 className="dashboard-header">
          Welcome, {auth?.user?.username || 'User'}!
        </h1>
        <p className="dashboard-subtitle">
          Manage your teams and collaborate on retro boards
        </p>
      </div>

      <div className="dashboard-content">
        {/* Teams Section */}
        <div className="dashboard-section teams-section">
          <div className="section-header">
            <h2>My Teams</h2>
            <Link to="/teams" className="btn btn-secondary">
              Manage Teams
            </Link>
          </div>

          <div className="teams-overview">
            {teamsState.isLoading ? (
              <p className="loading-text">Loading teams...</p>
            ) : teamsState.error ? (
              <p className="error-text">Error: {teamsState.error}</p>
            ) : teamsState.data.length === 0 ? (
              <div className="empty-teams">
                <p>No teams yet</p>
                <Link to="/teams" className="btn btn-primary">
                  Create or Join a Team
                </Link>
              </div>
            ) : (
              <div className="teams-grid-preview">
                {teamsState.data.slice(0, 3).map(team => (
                  <div key={team.id} className="team-card-small">
                    <h4 className="team-name-small">{team.name}</h4>
                    <p className="team-member-count">
                      {team.member_count || 0} members
                    </p>
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/teams/${team.id}`)}
                    >
                      View
                    </button>
                  </div>
                ))}
                {teamsState.data.length > 3 && (
                  <div className="more-teams">
                    <p>+ {teamsState.data.length - 3} more teams</p>
                    <Link to="/teams" className="btn btn-small btn-secondary">
                      View All
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Boards Section */}
        <div className="dashboard-section boards-section">
          <div className="section-header">
            <h2>Recent Boards</h2>
            <Link to="/retro-board/new" className="btn btn-primary">
              Create New Board
            </Link>
          </div>

          <div className="boards-overview">
            {boardsState.isLoading ? (
              <p className="loading-text">Loading boards...</p>
            ) : boardsState.error ? (
              <p className="error-text">Error: {boardsState.error}</p>
            ) : boardsState.data.length === 0 ? (
              <div className="empty-boards">
                <p>No boards yet</p>
                <Link to="/retro-board/new" className="btn btn-primary">
                  Create Your First Board
                </Link>
              </div>
            ) : (
              <div className="boards-grid-preview">
                {boardsState.data.slice(0, 4).map(board => (
                  <div key={board.id} className="board-card-small">
                    <h4 className="board-name-small">{board.title}</h4>
                    <p className="board-team-name">Team: {board.team?.name}</p>
                    <p className="board-date">Created: {board.created_at}</p>
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => navigate(`/retro-board/${board.id}`)}
                    >
                      Open Board
                    </button>
                  </div>
                ))}
                {boardsState.data.length > 4 && (
                  <div className="more-boards">
                    <p>+ {boardsState.data.length - 4} more boards</p>
                    <Link to="/boards" className="btn btn-small btn-secondary">
                      View All Boards
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
