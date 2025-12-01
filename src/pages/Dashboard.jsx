import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import getTeams from "../api/get-teams";
import getTeamBoards from "../api/get-team-boards";
import deleteBoard from "../api/delete-board";
import CreateBoardForm from "../components/CreateBoardForm";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // State to track which team's create modal is open
  const [createModalTeamId, setCreateModalTeamId] = useState(null);

  // Function to format date to "day month year"
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    });
  };

  // Function to handle board deletion
  const handleDeleteBoard = async (boardId, boardTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      await deleteBoard(boardId, auth.token);
      
      // Update the teams with boards state by removing the deleted board
      setTeamsWithBoards(prev => ({
        ...prev,
        data: prev.data.map(teamWithBoards => ({
          ...teamWithBoards,
          boards: teamWithBoards.boards.filter(board => board.id !== boardId)
        }))
      }));
    } catch (error) {
      console.error("Failed to delete board:", error);
      alert(`Failed to delete board: ${error.message}`);
    }
  };

  const [teamsWithBoards, setTeamsWithBoards] = useState({
    data: [],
    isLoading: true,
    error: ""
  });

  useEffect(() => {
    async function fetchTeamsAndBoards() {
      if (!auth?.token) {
        setTeamsWithBoards({
          data: [],
          isLoading: false,
          error: ""
        });
        return;
      }

      try {
        setTeamsWithBoards(prev => ({ ...prev, isLoading: true }));
        
        // First! Get all teams user belongs to
        const teams = await getTeams(auth.token);
        
        // Second! For each team, fetch its boards
        const teamsWithBoardsData = await Promise.all(
          teams.map(async (team) => {
            try {
              const boards = await getTeamBoards(team.id, auth.token);
              return { team, boards };
            } catch (error) {
              console.error(`Failed to fetch boards for team ${team.name}:`, error);
              return { team, boards: [] };
            }
          })
        );

        setTeamsWithBoards({
          data: teamsWithBoardsData,
          isLoading: false,
          error: ""
        });
      } catch (error) {
        setTeamsWithBoards({
          data: [],
          isLoading: false,
          error: error.message
        });
      }
    }
    

    fetchTeamsAndBoards();
  }, [auth?.token]);

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header-section">
        <h1 className="dashboard-header">
          Welcome, {auth?.user?.username || 'User'}!
        </h1>
      </div>

      {/* Teams and Boards */}
      <div className="dashboard-content">
        {teamsWithBoards.isLoading ? (
          <p className="loading-text">Loading...</p>
        ) : teamsWithBoards.error ? (
          <p className="error-text">Error: {teamsWithBoards.error}</p>
        ) : teamsWithBoards.data.length === 0 ? (
          <div className="empty-state">
            <p>You're not part of any teams yet.</p>
          </div>
        ) : (
          <div className="teams-boards-container">
            {teamsWithBoards.data.map(({ team, boards }) => (
              <div key={team.id} className="team-section">
                <div className="team-header">
                  <h3 className="team-name">{team.name}</h3>
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => setCreateModalTeamId(team.id)}
                  >
                    + New Board
                  </button>
                </div>
                
                {boards.length === 0 ? (
                  <p className="no-boards-text">No boards yet</p>
                ) : (
                  <div className="boards-grid">
                    {boards.map(board => (
                      <div key={board.id} className="board-card">
                        <h4 className="board-name">{board.title}</h4>
                        <p className="board-date">{formatDate(board.created_at)}</p>
                        <div className="board-card-actions">
                          <button 
                            className="btn btn-small btn-primary"
                            onClick={() => navigate(`/retro-board/${board.id}`)}
                          >
                            Open
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleDeleteBoard(board.id, board.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {createModalTeamId && (
        <div className="modal-overlay" onClick={() => setCreateModalTeamId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateBoardForm 
              teamId={createModalTeamId}
              onCancel={() => setCreateModalTeamId(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
