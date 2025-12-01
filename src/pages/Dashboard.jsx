import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import getTeams from "../api/get-teams";
import getTeamBoards from "../api/get-team-boards";
import deleteBoard from "../api/delete-board";
import createTeam from "../api/create-team";
import CreateBoardForm from "../components/CreateBoardForm";
import TeamDetailModal from "../components/TeamDetailModal";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  // State to track create board modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalTeamId, setCreateModalTeamId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // State for creating new team
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [createTeamLoading, setCreateTeamLoading] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openCreateModal = (teamId = null) => {
    setCreateModalTeamId(teamId);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateModalTeamId(null);
  };

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

  const openTeamDetail = (team) => {
    setSelectedTeam(team);
  };

  const closeTeamDetail = () => {
    setSelectedTeam(null);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    setCreateTeamLoading(true);
    try {
      const newTeam = await createTeam({ name: newTeamName.trim() }, auth.token);
      setNewTeamName('');
      setShowCreateTeamForm(false);
      
      // Add the new team to the list
      setTeamsWithBoards(prev => ({
        ...prev,
        data: [...prev.data, { team: newTeam, boards: [] }]
      }));
      
      // Open the new team's detail modal
      setSelectedTeam(newTeam);
    } catch (error) {
      console.error('Failed to create team:', error);
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setCreateTeamLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? '»' : '«'}
        </button>

        {!sidebarCollapsed && (
          <>
            <button 
              className="btn btn-primary sidebar-new-board-btn"
              onClick={() => openCreateModal()}
            >
              + New Board
            </button>

        <div className="sidebar-teams">
          <div className="sidebar-teams-header">
            <h3 className="sidebar-heading">Teams</h3>
            <button 
              className="sidebar-add-team-btn"
              onClick={() => setShowCreateTeamForm(!showCreateTeamForm)}
              title="Create New Team"
            >
              +
            </button>
          </div>

          {showCreateTeamForm && (
            <div className="sidebar-create-team-form">
              <input
                type="text"
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
                autoFocus
              />
              <div className="sidebar-create-team-actions">
                <button
                  onClick={handleCreateTeam}
                  disabled={createTeamLoading || !newTeamName.trim()}
                  className="btn-create"
                >
                  {createTeamLoading ? '...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateTeamForm(false);
                    setNewTeamName('');
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {teamsWithBoards.isLoading ? (
            <p className="sidebar-loading">Loading...</p>
          ) : (
            <ul className="sidebar-team-list">
              {teamsWithBoards.data.map(({ team }) => (
                <li key={team.id}>
                  <button 
                    className="sidebar-team-btn"
                    onClick={() => openTeamDetail(team)}
                  >
                    {team.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {auth?.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{auth?.user?.username || 'User'}</span>
            <span className="sidebar-user-email">{auth?.user?.email || ''}</span>
          </div>
        </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
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
                <div key={team.id} id={`team-${team.id}`} className="team-section">
                  <div className="team-header">
                    <h3 className="team-name">{team.name}</h3>
                    <button 
                      className="btn btn-small btn-primary"
                      onClick={() => openCreateModal(team.id)}
                    >
                      + Board
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
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateBoardForm 
              teamId={createModalTeamId}
              onCancel={closeCreateModal} 
            />
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      <TeamDetailModal
        isOpen={!!selectedTeam}
        onClose={closeTeamDetail}
        teamId={selectedTeam?.id}
        teamName={selectedTeam?.name}
      />
    </div>
  );
}

export default Dashboard;
