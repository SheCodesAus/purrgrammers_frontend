import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import getTeams from "../api/get-teams";
import testGetTeamBoards from "../api/get-team";
import deleteBoard from "../api/delete-board";
import CreateBoardForm from "../components/CreateBoardForm";
import "./Dashboard.css";
import getTeamBoards from "../api/get-team-boards";

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  
  // Modal state for CreateBoardForm
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      {/* Header Section */}
      <div className="dashboard-header-section">
        <h1 className="dashboard-header">
          Welcome, {auth?.user?.username || 'User'}!
        </h1>
        <p className="dashboard-subtitle">
          Manage your retro boards and collaborate with your team
        </p>
      </div>

      <div className="dashboard-content">
        {/* Boards Section */}
        <div className="dashboard-section boards-section">
          <div className="section-header">
            <h2>Recent Boards</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Board
            </button>
          </div>

          <div className="boards-overview">
            {teamsWithBoards.isLoading ? (
              <p className="loading-text">Loading boards...</p>
            ) : teamsWithBoards.error ? (
              <p className="error-text">Error: {teamsWithBoards.error}</p>
            ) : teamsWithBoards.data.flatMap(teamWithBoards => teamWithBoards.boards).length === 0 ? (
              <div className="empty-boards">
                <p>No boards yet</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Your First Board
                </button>
              </div>
            ) : (
              <div className="boards-grid-preview">
                {teamsWithBoards.data.flatMap(teamWithBoards => teamWithBoards.boards).slice(0, 4).map(board => (
                  <div key={board.id} className="board-card-small">
                    <h4 className="board-name-small">{board.title}</h4>
                    <p className="board-date">Created: {formatDate(board.created_at)}</p>
                    <div className="board-card-actions">
                      <button 
                        className="btn btn-small btn-primary"
                        onClick={() => navigate(`/retro-board/${board.id}`)}
                      >
                        Open Board
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteBoard(board.id, board.title)}
                        title="Delete board"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {teamsWithBoards.data.flatMap(teamWithBoards => teamWithBoards.boards).length > 4 && (
                  <div className="more-boards">
                    <p>+ {teamsWithBoards.data.flatMap(teamWithBoards => teamWithBoards.boards).length - 4} more boards</p>
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

      {/* Create Board Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateBoardForm onCancel={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
