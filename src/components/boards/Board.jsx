import { useState } from "react";
import BoardHeader from "./BoardHeader";
import Column from "./Column";
import CardPool from "./CardPool";
import "./Board.css";

function Board({ boardData, onBoardUpdate, currentUser, onNavigateBack }) {
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

    // Board title management
    const handleTitleUpdate = (newTitle) => {
        const updatedBoard = {
            ...boardData,
            title: newTitle
        };
        onBoardUpdate(updatedBoard);
    };

    // Card operations
    const handleAddCard = (columnId, cardText, cardType = null) => {
        const newCard = {
            id: Date.now(), // Simple ID generation for MVP
            text: cardText,
            author: currentUser?.username || "Anonymous",
            authorId: currentUser?.id,
            createdAt: new Date().toISOString(),
            votes: 0,
            type: cardType
        };

        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { ...column, cards: [...column.cards, newCard] }
                    : column
            ) || []
        };

        onBoardUpdate(updatedBoard);
        return newCard.id; // Return ID for immediate editing
    };

    const handleEditCard = (columnId, cardId, newText) => {
        const updatedBoard = {
            ...boardData,
            columns: boardData.columns?.map(column => 
                column.id === columnId 
                    ? { 
                        ...column, 
                        cards: column.cards.map(card => 
                            card.id === cardId ? { ...card, text: newText } : card
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

    const handleDrop = (e, columnId) => {
        e.preventDefault();
        
        if (dragState.isDragging && dragState.draggedCardType) {
            // Create a new card in the dropped column
            const cardId = handleAddCard(columnId, "", dragState.draggedCardType);
            
            // Set it to editing mode immediately
            setEditingCard(cardId);
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            />
        </div>
    );
}

export default Board;