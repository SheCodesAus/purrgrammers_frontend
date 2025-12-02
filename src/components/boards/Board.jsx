import { useState } from "react";
import BoardHeader from "./BoardHeader";
import Column from "./Column";
import CardPool from "./CardPool";
import createCard from "../../api/create-card";
import createColumn from "../../api/create-column";
import deleteColumn from "../../api/delete-column";
import { useAuth } from "../../hooks/use-auth";
import "./Board.css";
import ActionButton from "./ActionButton";

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
    const handleAddCard = async (columnId, cardText, cardType = null) => {
        try {
            setIsCreatingCard(true);
            
            const targetColumn = boardData?.columns?.find(col => col.id === columnId);
            const nextPosition = targetColumn?.cards?.length || 0;
            
            const cardData = {
                content: cardText || "",
                column: parseInt(columnId, 10),
                retro_board: parseInt(boardData?.id, 10),
                position: nextPosition,
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

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        
        if (dragState.isDragging && dragState.draggedCardType && !isCreatingCard) {
            const cardId = await handleAddCard(columnId, "", dragState.draggedCardType);
            if (cardId) {
                setEditingCard(cardId);
            }
        }

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
            <ActionButton />
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

            {cardError && (
                <div className="error-message">
                    {cardError}
                </div>
            )}
        </div>
    );
}

export default Board;