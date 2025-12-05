import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../components/ToastProvider";
import { useConfirm } from "../components/ConfirmProvider";
import getTeams from "../api/get-teams";
import getTeamBoards from "../api/get-team-boards";
import deleteBoard from "../api/delete-board";
import createTeam from "../api/create-team";
import CreateBoardForm from "../components/CreateBoardForm";
import TeamDetailModal from "../components/TeamDetailModal";
import ProfileModal from "../components/ProfileModal";
import Avatar from "../components/Avatar";
import "./Dashboard.css";

// Carousel component for boards
function BoardsCarousel({ boards, navigate, handleDeleteBoard, formatDate }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);


  const checkScrollability = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability, boards]);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  };

  return (
    <div className="boards-carousel-wrapper">
      {canScrollLeft && (
        <button 
          className="carousel-arrow carousel-arrow--left"
          onClick={scrollLeft}
        >
          <span className="material-icons">chevron_left</span>
        </button>
      )}
      
      <div 
        className="boards-carousel"
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        {boards.map(board => (
          <div 
            key={board.id} 
            className={`board-card ${board.is_active === false ? 'board-closed' : ''}`}
            onClick={() => navigate(`/retro-board/${board.id}`)}
          >
            <div className="board-card-header">
              <h4 className="board-name">{board.title}</h4>
              <button 
                className="board-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBoard(board.id, board.title);
                }}
                title="Delete board"
              >
                <span className="material-icons">delete</span>
              </button>
            </div>
            
            {/* Mini board preview */}
            <div className="board-preview">
              {board.columns?.slice(0, 4).map(column => (
                <div 
                  key={column.id}
                  className="board-preview-bar"
                  style={{ backgroundColor: column.color }}
                  title={column.title}
                />
              ))}
            </div>
            
            <div className="board-card-footer">
              <span className={`board-status ${board.is_active ? 'board-status--active' : 'board-status--closed'}`}>
                {board.is_active ? 'Active' : 'Closed'}
              </span>
              <span className="board-date">{formatDate(board.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {canScrollRight && (
        <button 
          className="carousel-arrow carousel-arrow--right"
          onClick={scrollRight}
        >
          <span className="material-icons">chevron_right</span>
        </button>
      )}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // State to track create board modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalTeamId, setCreateModalTeamId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    const confirmDelete = await confirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${boardTitle}"? This action cannot be undone.`
    });
    
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
      showToast(`Failed to delete board: ${error.message}`);
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
      showToast(`Failed to create team: ${error.message}`);
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
        {/* Latest Boards */}
        <div className="sidebar-boards">
          <h3 className="sidebar-heading">Latest Boards</h3>
          {teamsWithBoards.isLoading ? (
            <p className="sidebar-loading">Loading...</p>
          ) : (
            <ul className="sidebar-board-list">
              {teamsWithBoards.data
                .flatMap(({ team, boards }) => 
                  boards.map(board => ({ ...board, teamName: team.name }))
                )
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map(board => (
                  <li key={board.id}>
                    <button 
                      className={`sidebar-board-btn ${board.is_active === false ? 'sidebar-board-closed' : ''}`}
                      onClick={() => navigate(`/retro-board/${board.id}`)}
                      title={`${board.title} (${board.teamName})${board.is_active === false ? ' - Closed' : ''}`}
                    >
                      <div className="sidebar-board-title-row">
                        <span className="sidebar-board-title">{board.title}</span>
                        {board.is_active === false && (
                          <span className="sidebar-board-closed-badge">Closed</span>
                        )}
                      </div>
                      <span className="sidebar-board-team">{board.teamName}</span>
                    </button>
                  </li>
                ))
              }
              {teamsWithBoards.data.flatMap(({ boards }) => boards).length === 0 && (
                <li className="sidebar-empty">No boards yet</li>
              )}
            </ul>
          )}
          <button 
            className="sidebar-new-board-btn"
            onClick={() => openCreateModal()}
          >
            + New Board
          </button>
        </div>

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
        <div className="sidebar-user" onClick={() => setShowProfileModal(true)}>
          <Avatar initials={auth?.user?.initials} size={40} />
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
                    <BoardsCarousel 
                      boards={boards}
                      navigate={navigate}
                      handleDeleteBoard={handleDeleteBoard}
                      formatDate={formatDate}
                    />
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}

export default Dashboard;
