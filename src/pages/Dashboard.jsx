import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../components/ToastProvider";
import { useConfirm } from "../components/ConfirmProvider";
import getTeams from "../api/get-teams";
import getTeamBoards from "../api/get-team-boards";
import getBoard from "../api/get-board";
import deleteBoard from "../api/delete-board";
import createTeam from "../api/create-team";
import patchActionItem from "../api/patch-action-item";
import CreateBoardForm from "../components/CreateBoardForm";
import TeamDetailModal from "../components/TeamDetailModal";
import ProfileModal from "../components/ProfileModal";
import Avatar from "../components/Avatar";
import "./Dashboard.css";

// Carousel component with smart arrow visibility
function BoardsCarousel({ boards, navigate, handleDeleteBoard, formatDate }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [checkScrollability, boards]);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -260, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 260, behavior: 'smooth' });
  };

  return (
    <div className="boards-carousel-wrapper">
      {canScrollLeft && (
        <button className="carousel-arrow carousel-arrow-left" onClick={scrollLeft}>
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
        <button className="carousel-arrow carousel-arrow-right" onClick={scrollRight}>
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

  // Mobile tab state
  const [activeTab, setActiveTab] = useState('boards');

  // Sidebar collapse state - check initial window size
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  // Right sidebar collapse state for mobile/tablet
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  // Update sidebars on resize
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      } else if (window.innerWidth <= 1024) {
        // Tablet: keep left sidebar, collapse right
        setRightSidebarCollapsed(true);
      }
    };
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        
        // Second! For each team, fetch its boards (list)
        const teamsWithBoardsData = await Promise.all(
          teams.map(async (team) => {
            try {
              const boardsList = await getTeamBoards(team.id, auth.token);
              // Third! Fetch full details for each board (includes action_items)
              const boardsWithDetails = await Promise.all(
                boardsList.map(async (board) => {
                  try {
                    return await getBoard(board.id, auth.token);
                  } catch (error) {
                    console.error(`Failed to fetch details for board ${board.title}:`, error);
                    return board; // Fall back to list data
                  }
                })
              );
              return { team, boards: boardsWithDetails };
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

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  // On mobile, only allow expanded state after data is loaded
  const showExpanded = !sidebarCollapsed && (!isMobile || !teamsWithBoards.isLoading);

  return (
    <div className="dashboard-wrapper">
      {/* Welcome Header - Above the columns */}
      <div className="dashboard-header-section">
        <h1 className="dashboard-header">
          Welcome, {auth?.user?.first_name || auth?.user?.username || 'User'}!
        </h1>
      </div>

      {/* Three Column Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${showExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="sidebar-header-row">
          {showExpanded && <h3 className="sidebar-heading desktop-only">Latest Boards</h3>}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="toggle-icon-desktop">{sidebarCollapsed ? '»' : '«'}</span>
            <span className="toggle-icon-mobile">{sidebarCollapsed ? '⌄' : '⌃'}</span>
          </button>
        </div>

        {showExpanded && (
          <>
        {/* Mobile Tabs */}
        <div className="mobile-tabs">
          <button 
            className={`mobile-tab-btn ${activeTab === 'boards' ? 'active' : ''}`}
            onClick={() => setActiveTab('boards')}
          >
            Boards
          </button>
          <button 
            className={`mobile-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
          <button 
            className={`mobile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        {/* Latest Boards */}
        <div className={`sidebar-boards ${activeTab === 'boards' ? 'active' : ''}`}>
          {teamsWithBoards.isLoading ? (
            <p className="sidebar-loading">Loading...</p>
          ) : (
            <div className="sidebar-board-list-scroll">
              <ul className="sidebar-board-list">
                {teamsWithBoards.data
                  .flatMap(({ team, boards }) => 
                    boards.map(board => ({ ...board, teamName: team.name }))
                  )
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 3)
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
            </div>
          )}
        </div>

        <div className={`sidebar-new-board-wrapper ${activeTab === 'boards' ? 'active' : ''}`}>
          <button 
            className="sidebar-new-board-btn"
            onClick={() => openCreateModal()}
          >
            + New Board
          </button>
        </div>

        <div className={`sidebar-teams ${activeTab === 'teams' ? 'active' : ''}`}>
          <div className="sidebar-teams-header">
            <h3 className="sidebar-heading"><span className="material-icons">groups</span>Teams</h3>
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
            <div className="sidebar-team-list-scroll">
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
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className={`sidebar-user ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setShowProfileModal(true)}>
          <Avatar initials={auth?.user?.initials} userId={auth?.user?.id} size={40} />
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
        {/* Mobile Widgets Toggle - appears before content on mobile */}
        <div className="mobile-widgets-toggle-container">
          <button 
            className="mobile-widgets-toggle"
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          >
            <span className="material-icons">
              {rightSidebarCollapsed ? 'widgets' : 'expand_less'}
            </span>
            <span className="toggle-label">
              {rightSidebarCollapsed ? 'Show Widgets' : 'Hide Widgets'}
            </span>
          </button>
          
          {/* Mobile Widgets - inline when expanded */}
          {!rightSidebarCollapsed && (
            <div className="mobile-widgets-content">
              {/* Stats summary for mobile */}
              <div className="mobile-stats-row">
                <div className="mobile-stat">
                  <span className="stat-value">{teamsWithBoards.data.length}</span>
                  <span className="stat-label">Teams</span>
                </div>
                <div className="mobile-stat">
                  <span className="stat-value">
                    {teamsWithBoards.data.reduce((sum, { boards }) => sum + boards.length, 0)}
                  </span>
                  <span className="stat-label">Boards</span>
                </div>
                <div className="mobile-stat">
                  <span className="stat-value">
                    {teamsWithBoards.data.reduce((sum, { boards }) => 
                      sum + boards.filter(b => b.is_active).length, 0
                    )}
                  </span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="mobile-stat">
                  <span className="stat-value">
                    {teamsWithBoards.data.reduce((sum, { boards }) => 
                      sum + boards.reduce((cardSum, b) => 
                        cardSum + (b.columns?.reduce((colSum, col) => colSum + (col.cards?.length || 0), 0) || 0), 0
                      ), 0
                    )}
                  </span>
                  <span className="stat-label">Cards</span>
                </div>
              </div>

              {/* Action Items for mobile */}
              <div className="mobile-action-items">
                <h4 className="mobile-widget-title">
                  <span className="material-icons">checklist</span>
                  My Action Items
                </h4>
                {(() => {
                  const myActionItems = teamsWithBoards.data.flatMap(({ team, boards }) =>
                    boards.flatMap(board =>
                      (board.action_items || [])
                        .filter(item => item.assignee?.id === auth?.user?.id && item.status !== 'completed')
                        .map(item => ({
                          ...item,
                          boardTitle: board.title,
                          boardId: board.id,
                          teamName: team.name
                        }))
                    )
                  );

                  if (myActionItems.length === 0) {
                    return (
                      <div className="mobile-widget-empty">
                        <span className="material-icons">task_alt</span>
                        <span>No pending items</span>
                      </div>
                    );
                  }

                  return (
                    <div className="mobile-action-list">
                      {myActionItems.slice(0, 3).map(item => (
                        <div key={item.id} className="mobile-action-item">
                          <button
                            className="mobile-action-checkbox"
                            onClick={async () => {
                              try {
                                await patchActionItem(item.id, { status: 'completed' }, auth.token);
                                setTeamsWithBoards(prev => ({
                                  ...prev,
                                  data: prev.data.map(({ team, boards }) => ({
                                    team,
                                    boards: boards.map(board => ({
                                      ...board,
                                      action_items: board.action_items?.map(ai =>
                                        ai.id === item.id ? { ...ai, status: 'completed' } : ai
                                      )
                                    }))
                                  }))
                                }));
                                showToast('Action item completed!', 'success');
                              } catch (error) {
                                showToast('Failed to update action item', 'error');
                              }
                            }}
                          >
                            <span className="material-icons">radio_button_unchecked</span>
                          </button>
                          <span className="mobile-action-text">{item.content}</span>
                        </div>
                      ))}
                      {myActionItems.length > 3 && (
                        <span className="mobile-action-more">+{myActionItems.length - 3} more</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Activity for mobile */}
              <div className="mobile-activity">
                <h4 className="mobile-widget-title">
                  <span className="material-icons">trending_up</span>
                  This Week
                </h4>
                <div className="mobile-activity-row">
                  {(() => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const cardsThisWeek = teamsWithBoards.data.flatMap(({ boards }) =>
                      boards.flatMap(board =>
                        board.columns?.flatMap(col =>
                          col.cards?.filter(card => 
                            card.created_by?.id === auth?.user?.id &&
                            new Date(card.created_at) >= weekAgo
                          ) || []
                        ) || []
                      )
                    ).length;
                    const boardsThisWeek = teamsWithBoards.data.flatMap(({ boards }) => 
                      boards.filter(b => new Date(b.created_at) >= weekAgo)
                    ).length;

                    return (
                      <>
                        <div className="mobile-activity-stat">
                          <span className="material-icons">note_add</span>
                          <strong>{cardsThisWeek}</strong> cards
                        </div>
                        <div className="mobile-activity-stat">
                          <span className="material-icons">dashboard</span>
                          <strong>{boardsThisWeek}</strong> boards
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Sidebar Toggle - appears after widgets, before boards */}
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <span className="material-icons">
              {sidebarCollapsed ? 'menu' : 'expand_less'}
            </span>
            <span className="toggle-label">
              {sidebarCollapsed ? 'Show Teams & Profile' : 'Hide Teams & Profile'}
            </span>
          </button>

          {/* Mobile Sidebar Content - inline when expanded */}
          {!sidebarCollapsed && (
            <div className="mobile-sidebar-content">
              {/* Teams list */}
              <div className="mobile-teams-list">
                {teamsWithBoards.data.map(({ team }) => (
                  <button 
                    key={team.id}
                    className="mobile-team-btn"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <span className="team-dot"></span>
                    {team.name}
                  </button>
                ))}
              </div>
              {/* Profile button */}
              <button 
                className="mobile-profile-btn"
                onClick={() => setShowProfileModal(true)}
              >
                <Avatar initials={auth?.user?.initials} userId={auth?.user?.id} size={32} />
                <span>{auth?.user?.username || 'Profile'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Teams and Boards */}
        <div className="dashboard-content">
          {teamsWithBoards.isLoading ? (
            <div className="loading-container">
              <div className="wave-loader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p className="loading-text">Loading...</p>
            </div>
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

      {/* Right Sidebar - Stats & Action Items (hidden on mobile, uses inline widgets instead) */}
      <aside className="dashboard-right-sidebar">
        {/* Quick Stats */}
        <div className="stats-widget">
          <h3 className="widget-title">
            <span className="material-icons">insights</span>
            Quick Stats
          </h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{teamsWithBoards.data.length}</span>
              <span className="stat-label">Teams</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {teamsWithBoards.data.reduce((sum, { boards }) => sum + boards.length, 0)}
              </span>
              <span className="stat-label">Boards</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {teamsWithBoards.data.reduce((sum, { boards }) => 
                  sum + boards.filter(b => b.is_active).length, 0
                )}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {teamsWithBoards.data.reduce((sum, { boards }) => 
                  sum + boards.reduce((cardSum, b) => 
                    cardSum + (b.columns?.reduce((colSum, col) => colSum + (col.cards?.length || 0), 0) || 0), 0
                  ), 0
                )}
              </span>
              <span className="stat-label">Cards</span>
            </div>
          </div>
        </div>

        {/* Action Items Widget */}
        <div className="action-items-widget">
          <h3 className="widget-title">
            <span className="material-icons">checklist</span>
            My Action Items
          </h3>
          <div className="action-items-list">
            {(() => {
              // Collect all action items assigned to current user from all boards
              const myActionItems = teamsWithBoards.data.flatMap(({ team, boards }) =>
                boards.flatMap(board =>
                  (board.action_items || [])
                    .filter(item => item.assignee?.id === auth?.user?.id && item.status !== 'completed')
                    .map(item => ({
                      ...item,
                      boardTitle: board.title,
                      boardId: board.id,
                      teamName: team.name
                    }))
                )
              );

              if (teamsWithBoards.isLoading) {
                return <p className="widget-loading">Loading...</p>;
              }

              if (myActionItems.length === 0) {
                return (
                  <div className="widget-empty">
                    <span className="material-icons">task_alt</span>
                    <p>No pending action items</p>
                  </div>
                );
              }

              return myActionItems.slice(0, 5).map(item => (
                <div key={item.id} className="action-item-card">
                  <button
                    className="action-item-checkbox"
                    onClick={async () => {
                      try {
                        await patchActionItem(item.id, { status: 'completed' }, auth.token);
                        // Refresh the data
                        setTeamsWithBoards(prev => ({
                          ...prev,
                          data: prev.data.map(({ team, boards }) => ({
                            team,
                            boards: boards.map(board => ({
                              ...board,
                              action_items: board.action_items?.map(ai =>
                                ai.id === item.id ? { ...ai, status: 'completed' } : ai
                              )
                            }))
                          }))
                        }));
                        showToast('Action item completed!', 'success');
                      } catch (error) {
                        showToast('Failed to update action item', 'error');
                      }
                    }}
                    title="Mark as complete"
                  >
                    <span className="material-icons">radio_button_unchecked</span>
                  </button>
                  <div className="action-item-content">
                    <p className="action-item-text">{item.content}</p>
                    <span 
                      className="action-item-source"
                      onClick={() => navigate(`/retro-board/${item.boardId}`)}
                    >
                      {item.boardTitle}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
          {teamsWithBoards.data.flatMap(({ boards }) =>
            boards.flatMap(board =>
              (board.action_items || []).filter(item => 
                item.assignee?.id === auth?.user?.id && item.status !== 'completed'
              )
            )
          ).length > 5 && (
            <p className="widget-more">
              +{teamsWithBoards.data.flatMap(({ boards }) =>
                boards.flatMap(board =>
                  (board.action_items || []).filter(item => 
                    item.assignee?.id === auth?.user?.id && item.status !== 'completed'
                  )
                )
              ).length - 5} more items
            </p>
          )}
        </div>

        {/* Recent Activity Widget */}
        <div className="activity-widget">
          <h3 className="widget-title">
            <span className="material-icons">trending_up</span>
            Your Activity
          </h3>
          <div className="activity-stats">
            {(() => {
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              
              // Count boards created this week
              const boardsThisWeek = teamsWithBoards.data.flatMap(({ boards }) => 
                boards.filter(b => new Date(b.created_at) >= weekAgo)
              ).length;

              // Count cards created this week (if created_at is available)
              const cardsThisWeek = teamsWithBoards.data.flatMap(({ boards }) =>
                boards.flatMap(board =>
                  board.columns?.flatMap(col =>
                    col.cards?.filter(card => 
                      card.created_by?.id === auth?.user?.id &&
                      new Date(card.created_at) >= weekAgo
                    ) || []
                  ) || []
                )
              ).length;

              // Count completed action items this week
              const completedThisWeek = teamsWithBoards.data.flatMap(({ boards }) =>
                boards.flatMap(board =>
                  (board.action_items || []).filter(item => 
                    item.status === 'completed' && 
                    item.assignee?.id === auth?.user?.id
                  )
                )
              ).length;

              return (
                <>
                  <div className="activity-stat-row">
                    <span className="material-icons">note_add</span>
                    <span className="activity-stat-text">
                      <strong>{cardsThisWeek}</strong> cards created this week
                    </span>
                  </div>
                  <div className="activity-stat-row">
                    <span className="material-icons">dashboard</span>
                    <span className="activity-stat-text">
                      <strong>{boardsThisWeek}</strong> new boards this week
                    </span>
                  </div>
                  <div className="activity-stat-row">
                    <span className="material-icons">check_circle</span>
                    <span className="activity-stat-text">
                      <strong>{completedThisWeek}</strong> action items completed
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </aside>

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
    </div>
  );
}

export default Dashboard;
