import { useState } from "react";
import BoardHeader from "./BoardHeader";
import Column from "./Column";
import CardPool from "./CardPool";
import createCard from "../../api/create-card";
import { useAuth } from "../../hooks/use-auth";
import "./Board.css";

function Board({ boardData, onBoardUpdate, currentUser, onNavigateBack }) {
    const { auth } = useAuth();
    
    // Debug logging
    console.log("Board received boardData:", boardData);
    console.log("boardData.columns:", boardData?.columns);
    console.log("Type of columns:", typeof boardData?.columns);
    
    // Drag and drop state
    const [dragState, setDragState] = useState({
        isDragging: false,
        draggedCardType: null,
        dragOverColumn: null
    });

    // Editing state
    const [editingCard, setEditingCard] = useState(null);

    // Card creation state
    const [isCreatingCard, setIsCreatingCard] = useState(false);

    // Error state
    const [cardError, setCardError] = useState(null);

    // Board title management
    const handleTitleUpdate = (newTitle) => {
        const updatedBoard = {
            ...boardData,
            title: newTitle
        };
        onBoardUpdate(updatedBoard);
    };

    // Card operations
    const handleAddCard = async (columnId, cardText, cardType = null) => {
        try {
            setIsCreatingCard(true);
            
            // Debug logging
            console.log("Creating card with data:", { columnId, cardText, cardType });
            console.log("Auth token:", auth?.token ? "[Token present]" : "[No token]");
            console.log("Current board data:", boardData);
            console.log("Available columns:", boardData?.columns);
            console.log("Target column:", boardData?.columns?.find(col => col.id === columnId));
            console.log("Sample existing cards:", boardData?.columns?.flatMap(col => col.cards || []).slice(0, 2));
            console.log("Auth token (first 20 chars):", auth?.token?.substring(0, 20));
            
            // Find target column and calculate next position
            const targetColumn = boardData?.columns?.find(col => col.id === columnId);
            const nextPosition = targetColumn?.cards?.length || 0;
            
            console.log("Target column for color:", targetColumn);
            
            // Prepare card data for API - backend will set status automatically
            const cardData = {
                content: cardText || "",  // Empty string for blank cards
                column: parseInt(columnId, 10), // Ensure column ID is an integer
                retro_board: parseInt(boardData?.id, 10), // Add board reference
                position: nextPosition,  // Use next available position
                // Add column color if backend needs it
                ...(targetColumn?.color && { color: targetColumn.color })
            };
            
            console.log("Sending card data to API:", cardData);

            // Call the API
            const newCard = await createCard(cardData, auth.token);
            
            // Update board state with real card data from backend
            const updatedBoard = {
                ...boardData,
                columns: boardData.columns?.map(column => 
                    column.id === columnId 
                        ? { ...column, cards: [...(column.cards || []), newCard] }
                        : column
                ) || []
            };

            onBoardUpdate(updatedBoard);
            return newCard.id; // Return real card ID from backend
            
        } catch (error) {
            console.error("Failed to create card:", error);
            console.error("Error details:", {
                message: error.message,
                columnId,
                cardText,
                authToken: auth?.token ? "[Present]" : "[Missing]"
            });
            
            // Show error to user
            setCardError(`Failed to create card: ${error.message}`);
            setTimeout(() => setCardError(null), 5000); // Clear after 5 seconds
            return null;
        } finally {
            setIsCreatingCard(false);
        }
    };

    const handleEditCard = (columnId, cardId, newText) => {
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
        e.preventDefault(); // Allow drop
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
        // Only clear if we're leaving the column entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragState(prev => ({
                ...prev,
                dragOverColumn: prev.dragOverColumn === columnId ? null : prev.dragOverColumn
            }));
        }
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        
        if (dragState.isDragging && dragState.draggedCardType && !isCreatingCard) {
            // Create a new card in the dropped column
            const cardId = await handleAddCard(columnId, "", dragState.draggedCardType);
            
            // Set to editing mode if card was created successfully
            if (cardId) {
                setEditingCard(cardId);
            }
        }

        // Reset drag state
        setDragState({
            isDragging: false,
            draggedCardType: null,
            dragOverColumn: null
        });
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
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDrop={(e) => handleDrop(e, column.id)}
                            onDragEnter={() => handleDragEnter(column.id)}
                            onDragLeave={(e) => handleDragLeave(e, column.id)}
                        />
                    )) || <div>No columns found - check backend API</div>}
                </div>
            </div>
            
            <CardPool
                dragState={dragState}
                isCreatingCard={isCreatingCard}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            />

            {/* Error display */}
            {cardError && (
                <div className="error-message">
                    {cardError}
                </div>
            )}
        </div>
    );
}

export default Board;