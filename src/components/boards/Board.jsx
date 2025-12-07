import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import BoardHeader from "./BoardHeader";
import Column from "./Column";
import BoardPanel from "./BoardPanel";
import ActionBar from "./ActionBar";
import ControlPanel from "./ControlPanel";
import CardModal from "./CardModal";
import createCard from "../../api/create-card";
import createColumn from "../../api/create-column";
import deleteColumn from "../../api/delete-column";
import getTags from "../../api/get-tags";
import startNewRound from "../../api/start-new-round";
import { useAuth } from "../../hooks/use-auth";
import { useBoardWebSocket } from "../../hooks/use-board-web-socket";
import { useToast } from "../ToastProvider";
import "./Board.css";

function Board({ boardData, onBoardUpdate, currentUser, onNavigateBack }) {
    const { auth } = useAuth();
    const { showToast } = useToast();
    
    // State management
    const [dragState, setDragState] = useState({
        isDragging: false,
        draggedCardType: null,
        dragOverColumn: null
    });
    const [editingCard, setEditingCard] = useState(null);
    const [isCreatingCard, setIsCreatingCard] = useState(false);
    const [cardError, setCardError] = useState(null);
    
    // Anonymous modal state
    const [showAnonModal, setShowAnonModal] = useState(false);
    const [pendingCardColumn, setPendingCardColumn] = useState(null);
    const [newCardModalId, setNewCardModalId] = useState(null); // For opening modal on mobile after card creation
    
    // Mobile controls panel state
    const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);
    
    // Voting state - tracks remaining votes for current user
    const [remainingVotes, setRemainingVotes] = useState(boardData?.user_remaining_votes ?? 5);
    const [currentVotingRound, setCurrentVotingRound] = useState(boardData?.current_voting_round || null);
    const [maxVotesPerUser] = useState(boardData?.max_votes_per_user ?? 5);

    // Tags state
    const [availableTags, setAvailableTags] = useState([]);

    // Team refresh ref
    const teamRefreshRef = useRef(null);

    // Callback to receive team refresh function from BoardHeader
    const handleTeamRefreshReady = useCallback((refreshFn) => {
        teamRefreshRef.current = refreshFn;
    }, []);

    // Websocket message handler
    const handleWebSocketMessage = useCallback((message) => {
        console.log('WebSocket message received:', message.type, message.data);
        switch (message.type) {

            // board
            case 'board_updated':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    ...message.data
                }));
                break;

            // columns

            case 'column_created':
                onBoardUpdate(prevBoard => {
                    // check if column exists - prevent duplicates
                    const columnExists = prevBoard.columns?.some(col =>
                        col.id === message.data.id
                    );

                    // exists, cancels and returns previous board
                    if (columnExists) {
                        return prevBoard;
                    }

                    return {
                        ...prevBoard,
                        columns: [...(prevBoard.columns || []), message.data]
                    };
                });
                break;

            // finds the column by ID and merges the updated data into it
            case 'column_updated':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    columns: prevBoard.columns?.map(col =>
                        col.id === message.data.id ? { ...col, ...message.data } : col
                    ) || []
                }));
                break;

            case 'column_deleted':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    columns: prevBoard.columns?.filter(col => col.id !== message.data.id) || []
                }));
                break;

            case 'card_created':
                onBoardUpdate(prevBoard => {
                    // Check if card already exists (prevent duplicates)
                    const cardExists = prevBoard.columns?.some(col =>
                        col.cards?.some(card => card.id === message.data.id)
                    );
                    
                    if (cardExists) {
                        return prevBoard; // Don't add duplicate
                    }
                    
                    const updatedBoard = {
                        ...prevBoard,
                        columns: prevBoard.columns?.map(col =>
                            col.id === message.data.column
                            ? { ...col, cards: [...(col.cards || []), message.data] }
                            : col
                        ) || []
                    };
                    return updatedBoard;
                });
                break;

            case 'card_updated':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    columns: prevBoard.columns?.map(col => ({
                        ...col,
                        cards: col.cards?.map(card =>
                            card.id === message.data.id ? message.data : card
                        ) || []
                    })) || []
                }));
                break;

            case 'card_deleted':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    columns: prevBoard.columns?.map(col => ({
                        ...col,
                        cards: col.cards?.filter(card => card.id !== message.data.id) || []
                    })) || []
                }));
                break;

            case 'card_voted':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    columns: prevBoard.columns?.map(col => ({
                        ...col,
                        cards: col.cards?.map(card =>
                            card.id === message.data.id 
                                ? { ...card, vote_count: message.data.vote_count }
                                : card
                        ) || []
                    })) || []
                }));
                break;

            case 'action_item_created':
                onBoardUpdate(prevBoard => {
                    // Check if action item already exists (prevent duplicates)
                    const exists = prevBoard.action_items?.some(item => item.id === message.data.id);
                    if (exists) {
                        return prevBoard;
                    }
                    return {
                        ...prevBoard,
                        action_items: [...(prevBoard.action_items || []), message.data]
                    };
                });
                break;

            case 'action_item_updated':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    action_items: prevBoard.action_items?.map(item =>
                        item.id === message.data.id ? message.data : item
                    ) || []
                }));
                break;

            case 'action_item_deleted':
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    action_items: prevBoard.action_items?.filter(item => 
                        item.id !== message.data.id
                    ) || []
                }));
                break;

            case 'voting_round_started':
                // Update current voting round and reset votes
                setCurrentVotingRound(message.data.current_voting_round);
                setRemainingVotes(maxVotesPerUser); // Reset to full votes
                // Update board data with new round info
                onBoardUpdate(prevBoard => ({
                    ...prevBoard,
                    current_voting_round: message.data.current_voting_round,
                    user_remaining_votes: maxVotesPerUser,
                    user_vote_count: 0
                }));
                break;

            // Teams
            case 'team_updated':
                console.log('Team updated', message.data);
                if (teamRefreshRef.current) {
                    teamRefreshRef.current();
                }
                break;

            default:
                console.log('Unknown WebSocket message:', message);
        }
    }, [onBoardUpdate]);    // Initialise WebSocket connection
    useBoardWebSocket(boardData?.id, handleWebSocketMessage);

    // Fetch available tags on mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const tags = await getTags(auth.token);
                setAvailableTags(tags);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        
        if (auth.token) {
            fetchTags();
        }
    }, [auth.token]);

    // FIX #1: State cleanup when board data changes
    useEffect(() => {
        // Reset all interaction states when board structure changes
        setDragState({
            isDragging: false,
            draggedCardType: null,
            dragOverColumn: null
        });
        
        // Check if currently editing card still exists
        if (editingCard) {
            const cardExists = boardData?.columns?.some(column => 
                column.cards?.some(card => card.id === editingCard)
            );
            
            if (!cardExists) {
                console.warn(`Editing card ${editingCard} no longer exists, clearing edit state`);
                setEditingCard(null);
            }
        }
    }, [boardData?.columns, editingCard]);

    // Drag timeout safety net
    useEffect(() => {
        let dragTimeout;
        
        if (dragState.isDragging) {
            // Force reset drag state after 10 seconds (safety net)
            dragTimeout = setTimeout(() => {
                console.warn("Drag state timeout, resetting");
                setDragState({
                    isDragging: false,
                    draggedCardType: null,
                    dragOverColumn: null
                });
            }, 10000);
        }
        
        return () => clearTimeout(dragTimeout);
    }, [dragState.isDragging]);

    // Board management
    const handleTitleUpdate = (newTitle) => {
        const updatedBoard = {
            ...boardData,
            title: newTitle
        };
        onBoardUpdate(updatedBoard);
    };

    const handleBoardStatusChange = (newStatus) => {
        const updatedBoard = {
            ...boardData,
            is_active: newStatus
        };
        onBoardUpdate(updatedBoard);
    };

    const handleBoardDelete = (boardId) => {
        if (onNavigateBack) {
            onNavigateBack();
        }
    };

    // Action bar handlers
    const handleActionItemCreate = (newItem) => {
        // Optimistic update - add item immediately
        // WebSocket will also send this, but we check for duplicates there
        onBoardUpdate(prevBoard => {
            const exists = prevBoard.action_items?.some(item => item.id === newItem.id);
            if (exists) return prevBoard;
            return {
                ...prevBoard,
                action_items: [...(prevBoard.action_items || []), newItem]
            };
        });
    };

    const handleActionItemUpdate = (updatedItem) => {
        onBoardUpdate(prevBoard => ({
            ...prevBoard,
            action_items: prevBoard.action_items?.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            ) || []
        }));
    };

    const handleActionItemDelete = (actionItemId) => {
        onBoardUpdate(prevBoard => ({
            ...prevBoard,
            action_items: prevBoard.action_items?.filter(item => 
                item.id !== actionItemId
            ) || []
        }));
    };

    // Voting round management
    const handleStartNewRound = async () => {
        try {
            const result = await startNewRound(boardData?.id, auth.token);
            // WebSocket will handle the broadcast, but update locally too
            setCurrentVotingRound(result.current_voting_round);
            setRemainingVotes(maxVotesPerUser);
        } catch (error) {
            console.error('Failed to start new voting round:', error);
            showToast(`Failed to start new round: ${error.message}`);
        }
    };

    // Get team members for assignee dropdown
    const teamMembers = boardData?.team?.members || [];

    // Column management
    const handleAddColumn = async () => {
        try {
            const nextPosition = (boardData?.columns?.length || 0) + 1;
            const columnData = {
                retro_board: parseInt(boardData?.id, 10),
                title: "New Column",
                position: nextPosition
            };

            const newColumn = await createColumn(columnData, auth.token);
            const updatedBoard = {
                ...boardData,
                columns: [...(boardData?.columns || []), newColumn]
            };

            onBoardUpdate(updatedBoard);
        } catch (error) {
            console.error("Failed to create column:", error);
            showToast(`Failed to create column: ${error.message}`);
        }
    };

    const handleColumnUpdate = (updatedColumn) => {
        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === updatedColumn.id ? updatedColumn : column
            ) || []
        };
        onBoardUpdate(updatedBoard);
    };

    const handleDeleteColumn = async (columnId) => {
        try {
            await deleteColumn(columnId, auth.token);
            const updatedBoard = {
                ...boardData,
                columns: boardData.columns?.filter(column => column.id !== columnId) || []
            };
            onBoardUpdate(updatedBoard);
        } catch (error) {
            console.error("Failed to delete column:", error);
            showToast(`Failed to delete column: ${error.message}`);
        }
    };

    // Card management
    const handleAddCard = async (columnId, cardText, isAnonymous = false) => {
        try {
            setIsCreatingCard(true);
            
            const targetColumn = boardData?.columns?.find(col => col.id === columnId);
            // Find the max position in the column and add 1 (handles gaps from deleted cards)
            const maxPosition = targetColumn?.cards?.reduce((max, card) => 
                Math.max(max, card.position || 0), -1) ?? -1;
            const nextPosition = maxPosition + 1;
            
            const cardData = {
                content: cardText || "",
                column: parseInt(columnId, 10),
                retro_board: parseInt(boardData?.id, 10),
                position: nextPosition,
                is_anonymous: isAnonymous,
                ...(targetColumn?.color && { color: targetColumn.color })
            };

            const newCard = await createCard(cardData, auth.token);
            const updatedBoard = {
                ...boardData,
                columns: boardData.columns?.map(column => 
                    column.id === columnId 
                        ? { ...column, cards: [...(column.cards || []), newCard] }
                        : column
                ) || []
            };

            onBoardUpdate(updatedBoard);
            return newCard.id;
            
        } catch (error) {
            console.error("Failed to create card:", error);
            setCardError(`Failed to create card: ${error.message}`);
            setTimeout(() => setCardError(null), 5000);
            return null;
        } finally {
            setIsCreatingCard(false);
        }
    };

    // CRITICAL FIX #2: Defensive card editing
    const handleEditCard = (columnId, cardId, newText) => {
        // Validate card still exists
        const targetColumn = boardData.columns?.find(col => col.id === columnId);
        const targetCard = targetColumn?.cards?.find(card => card.id === cardId);
        
        if (!targetCard) {
            console.warn(`Card ${cardId} no longer exists, cancelling edit`);
            setEditingCard(null);
            return;
        }

        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { 
                        ...column, 
                        cards: column.cards.map(card => 
                            card.id === cardId ? { ...card, content: newText } : card
                        ) 
                    }
                    : column
            ) || []
        };

        onBoardUpdate(updatedBoard);
        setEditingCard(null);
    };

    const handleDeleteCard = (columnId, cardId) => {
        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { ...column, cards: column.cards.filter(card => card.id !== cardId) }
                    : column
            ) || []
        };

        onBoardUpdate(updatedBoard);
    };

    // Vote change handler - updates card vote count and remaining votes
    const handleVoteChange = (columnId, cardId, voteData) => {
        // Update remaining votes from response
        if (voteData.remaining_votes !== undefined) {
            setRemainingVotes(voteData.remaining_votes);
        }
        
        // Update the card's vote count and user_vote_count
        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { 
                        ...column, 
                        cards: column.cards.map(card => 
                            card.id === cardId 
                                ? { 
                                    ...card, 
                                    vote_count: voteData.total_card_votes,
                                    user_vote_count: voteData.user_votes_on_card
                                } 
                                : card
                        ) 
                    }
                    : column
            ) || []
        };

        onBoardUpdate(updatedBoard);
    };

    // Handle card tags change
    const handleCardTagsChange = (columnId, updatedCard) => {
        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { 
                        ...column, 
                        cards: column.cards.map(card => 
                            card.id === updatedCard.id ? updatedCard : card
                        ) 
                    }
                    : column
            ) || []
        };
        onBoardUpdate(updatedBoard);
    };

    // Drag and drop handlers
    const handleDragStart = (cardType) => {
        setDragState({
            isDragging: true,
            draggedCardType: cardType,
            dragOverColumn: null
        });
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        if (dragState.dragOverColumn !== columnId) {
            setDragState(prev => ({
                ...prev,
                dragOverColumn: columnId
            }));
        }
    };

    const handleDragEnter = (columnId) => {
        setDragState(prev => ({
            ...prev,
            dragOverColumn: columnId
        }));
    };

    const handleDragLeave = (e, columnId) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragState(prev => ({
                ...prev,
                dragOverColumn: prev.dragOverColumn === columnId ? null : prev.dragOverColumn
            }));
        }
    };

    // Robust drag state management
    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        
        // Reset drag state immediately to prevent stuck state
        const currentDragState = { ...dragState };
        setDragState({
            isDragging: false,
            draggedCardType: null,
            dragOverColumn: null
        });
        
        if (currentDragState.isDragging && currentDragState.draggedCardType && !isCreatingCard) {
            // Show anonymous modal instead of creating immediately
            setPendingCardColumn(columnId);
            setShowAnonModal(true);
        }
    };

    // Handle anonymous modal choice
    const handleAnonChoice = async (isAnonymous) => {
        setShowAnonModal(false);
        
        if (pendingCardColumn) {
            try {
                const cardId = await handleAddCard(pendingCardColumn, "", isAnonymous);
                if (cardId) {
                    // On mobile, open the card modal instead of inline editing
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile) {
                        setNewCardModalId(cardId);
                    } else {
                        setEditingCard(cardId);
                    }
                }
            } catch (error) {
                console.error("Failed to create card:", error);
            }
        }
        
        setPendingCardColumn(null);
    };

    const handleAnonModalClose = () => {
        setShowAnonModal(false);
        setPendingCardColumn(null);
    };

    const handleDragEnd = () => {
        setDragState({
            isDragging: false,
            draggedCardType: null,
            dragOverColumn: null
        });
    };

    return (
        <div className="board">
            <BoardHeader 
                boardData={boardData}
                onTitleUpdate={handleTitleUpdate}
                onBoardDelete={handleBoardDelete}
                onBoardStatusChange={handleBoardStatusChange}
                onTeamRefreshReady={handleTeamRefreshReady}
                onAddColumn={handleAddColumn}
                mobileControls={
                    <button 
                        className="board-panel__mobile-btn"
                        onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
                    >
                        <span className="material-icons">tune</span>
                        <span className="mobile-btn-text">Controls</span>
                        {(boardData?.action_items?.length > 0) && (
                            <span className="board-panel__mobile-badge">{boardData.action_items.length}</span>
                        )}
                    </button>
                }
            />
            
            <div className="board-main">
                <div className="board-content">
                    <div className="columns-container">
                        <div className="columns-inner">
                            {boardData.columns?.map(column => (
                                <Column
                                    key={column.id}
                                    column={column}
                                    currentUser={currentUser}
                                    dragState={dragState}
                                    editingCard={editingCard}
                                    remainingVotes={remainingVotes}
                                    availableTags={availableTags}
                                    onEditCard={(cardId, newText) => handleEditCard(column.id, cardId, newText)}
                                    onDeleteCard={(cardId) => handleDeleteCard(column.id, cardId)}
                                    onVoteChange={(cardId, voteData) => handleVoteChange(column.id, cardId, voteData)}
                                    onCardTagsChange={handleCardTagsChange}
                                    onSetEditingCard={setEditingCard}
                                    onColumnUpdate={handleColumnUpdate}
                                    onDeleteColumn={handleDeleteColumn}
                                    onDragOver={(e) => handleDragOver(e, column.id)}
                                    onDrop={(e) => handleDrop(e, column.id)}
                                    onDragEnter={() => handleDragEnter(column.id)}
                                    onDragLeave={(e) => handleDragLeave(e, column.id)}
                                    onAddCard={() => {
                                        setPendingCardColumn(column.id);
                                        setShowAnonModal(true);
                                    }}
                                />
                            )) || <div>No columns found - check backend API</div>}
                        </div>
                    </div>
                </div>

                {/* Desktop: Original separate panels */}
                <div className="desktop-panels">
                    <ActionBar
                        actionItems={boardData?.action_items || []}
                        teamMembers={teamMembers}
                        boardId={boardData?.id}
                        onActionItemCreate={handleActionItemCreate}
                        onActionItemUpdate={handleActionItemUpdate}
                        onActionItemDelete={handleActionItemDelete}
                    />
                    <ControlPanel
                        dragState={dragState}
                        isCreatingCard={isCreatingCard}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onAddColumn={handleAddColumn}
                        currentVotingRound={currentVotingRound}
                        remainingVotes={remainingVotes}
                        maxVotes={maxVotesPerUser}
                        onStartNewRound={handleStartNewRound}
                    />
                </div>

                {/* Mobile: Combined panel as dropdown */}
                <BoardPanel
                    actionItems={boardData?.action_items || []}
                    teamMembers={teamMembers}
                    boardId={boardData?.id}
                    onActionItemCreate={handleActionItemCreate}
                    onActionItemUpdate={handleActionItemUpdate}
                    onActionItemDelete={handleActionItemDelete}
                    dragState={dragState}
                    isCreatingCard={isCreatingCard}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onAddColumn={handleAddColumn}
                    currentVotingRound={currentVotingRound}
                    remainingVotes={remainingVotes}
                    maxVotes={maxVotesPerUser}
                    onStartNewRound={handleStartNewRound}
                    boardTitle={boardData?.title}
                    isActive={boardData?.is_active}
                    onBoardStatusChange={handleBoardStatusChange}
                    onBoardDelete={handleBoardDelete}
                    isMobileOpen={isMobileControlsOpen}
                    onMobileClose={() => setIsMobileControlsOpen(false)}
                    mobileOnly={true}
                />
            </div>

            {/* Anonymous Choice Modal */}
            {showAnonModal && (
                <div className="anon-modal-overlay" onClick={handleAnonModalClose}>
                    <div className="anon-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Post this card as...</h3>
                        <div className="anon-modal-buttons">
                            <button 
                                className="anon-btn with-name"
                                onClick={() => handleAnonChoice(false)}
                            >
                                {auth.user?.username || 'Me'}
                            </button>
                            <button 
                                className="anon-btn anonymous"
                                onClick={() => handleAnonChoice(true)}
                            >
                                Anonymous
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Card Modal - for mobile */}
            {newCardModalId && (() => {
                // Find the card and its column
                let newCard = null;
                let cardColumn = null;
                for (const col of boardData.columns || []) {
                    const found = col.cards?.find(c => c.id === newCardModalId);
                    if (found) {
                        newCard = found;
                        cardColumn = col;
                        break;
                    }
                }
                
                if (!newCard) return null;
                
                return createPortal(
                    <CardModal
                        card={newCard}
                        columnColor={cardColumn?.color}
                        columnTitle={cardColumn?.title}
                        isOpen={true}
                        remainingVotes={remainingVotes}
                        availableTags={availableTags}
                        startInEditMode={true}
                        onClose={() => setNewCardModalId(null)}
                        onEdit={(newContent) => {
                            handleEditCard(cardColumn.id, newCardModalId, newContent);
                        }}
                        onDelete={() => {
                            handleDeleteCard(cardColumn.id, newCardModalId);
                            setNewCardModalId(null);
                        }}
                        onVoteChange={(voteData) => handleVoteChange(cardColumn.id, newCardModalId, voteData)}
                        onTagsChange={(updatedCard) => handleCardTagsChange(cardColumn.id, updatedCard)}
                    />,
                    document.body
                );
            })()}

            {cardError && (
                <div className="error-message">
                    {cardError}
                </div>
            )}
        </div>
    );
}

export default Board;