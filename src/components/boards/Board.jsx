import { useState, useEffect, useCallback } from "react";
import BoardHeader from "./BoardHeader";
import Column from "./Column";
import CardPool from "./CardPool";
import createCard from "../../api/create-card";
import createColumn from "../../api/create-column";
import deleteColumn from "../../api/delete-column";
import { useAuth } from "../../hooks/use-auth";
import { useBoardWebSocket } from "../../hooks/use-board-web-socket";
import "./Board.css";

function Board({ boardData, onBoardUpdate, currentUser, onNavigateBack }) {
    const { auth } = useAuth();
    
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

    // Websocket message handler
    const handleWebSocketMessage = useCallback((message) => {
        switch (message.type) {
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

            default:
                console.log('Unknown WebSocket message:', message);
        }
    }, [onBoardUpdate]);    // Initialise WebSocket connection
    useBoardWebSocket(boardData?.id, handleWebSocketMessage);

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

    const handleBoardDelete = (boardId) => {
        if (onNavigateBack) {
            onNavigateBack();
        }
    };

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
            alert(`Failed to create column: ${error.message}`);
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
            alert(`Failed to delete column: ${error.message}`);
        }
    };

    // Card management
    const handleAddCard = async (columnId, cardText, isAnonymous = false) => {
        try {
            setIsCreatingCard(true);
            
            const targetColumn = boardData?.columns?.find(col => col.id === columnId);
            const nextPosition = targetColumn?.cards?.length || 0;
            
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

    // CRITICAL FIX #3: Robust drag state management
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
                    setEditingCard(cardId);
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

    // Add column button component
    function AddColumnButton({ onClick }) {
        return (
            <div className="add-column-container">
                <button
                    className="btn btn-primary"
                    onClick={onClick}
                >
                    + Add Column
                </button>
            </div>
        );
    }

    return (
        <div className="board">
            <BoardHeader 
                boardData={boardData}
                onTitleUpdate={handleTitleUpdate}
                onBoardDelete={handleBoardDelete}
            />
            
            <div className="board-content">
                <div className="columns-container">
                    {boardData.columns?.map(column => (
                        <Column
                            key={column.id}
                            column={column}
                            currentUser={currentUser}
                            dragState={dragState}
                            editingCard={editingCard}
                            onEditCard={(cardId, newText) => handleEditCard(column.id, cardId, newText)}
                            onDeleteCard={(cardId) => handleDeleteCard(column.id, cardId)}
                            onSetEditingCard={setEditingCard}
                            onColumnUpdate={handleColumnUpdate}
                            onDeleteColumn={handleDeleteColumn}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDrop={(e) => handleDrop(e, column.id)}
                            onDragEnter={() => handleDragEnter(column.id)}
                            onDragLeave={(e) => handleDragLeave(e, column.id)}
                        />
                    )) || <div>No columns found - check backend API</div>}
                    <AddColumnButton onClick={handleAddColumn} />
                </div>
            </div>
            
            <CardPool
                dragState={dragState}
                isCreatingCard={isCreatingCard}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            />

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

            {cardError && (
                <div className="error-message">
                    {cardError}
                </div>
            )}
        </div>
    );
}

export default Board;