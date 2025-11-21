import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import Board from "../components/Board/Board";
import "./RetroBoardPage.css";

function RetroBoardPage() {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [boardState, setBoardState] = useState({
        data: null,
        isLoading: true,
        error: ""
    });

    useEffect(() => {
        async function fetchBoard() {
            try {
                setBoardState(prev => ({ ...prev, isLoading: true }));
                
                // TODO: Replace with actual API call
                // const response = await getBoardById(boardId);
                
                // For MVP, create a basic board structure
                setBoardState({
                    data: {
                        id: boardId,
                        title: "Click to edit title",
                        date: new Date().toLocaleDateString(),
                        participants: [],
                        columns: [
                            { id: 1, title: "What went well?", type: "positive", cards: [] },
                            { id: 2, title: "What could improve?", type: "negative", cards: [] },
                            { id: 3, title: "Action items", type: "action", cards: [] }
                        ]
                    },
                    isLoading: false,
                    error: ""
                });
                
            } catch (error) {
                setBoardState({
                    data: null,
                    isLoading: false,
                    error: "Failed to load board. Please try again."
                });
            }
        }

        if (boardId) {
            fetchBoard();
        }
    }, [boardId]);

    function handleBoardUpdate(updatedBoardData) {
        setBoardState(prev => ({
            ...prev,
            data: updatedBoardData
        }));
    }

    if (boardState.isLoading) {
        return (
            <div className="retro-board-page">
                <div className="loading-container">
                    <p>Loading board...</p>
                </div>
            </div>
        );
    }

    if (boardState.error) {
        return (
            <div className="retro-board-page">
                <div className="error-container">
                    <p className="error">{boardState.error}</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!boardState.data) {
        return (
            <div className="retro-board-page">
                <div className="error-container">
                    <p>Board not found</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="retro-board-page">
            <Board 
                boardData={boardState.data}
                onBoardUpdate={handleBoardUpdate}
                currentUser={auth?.user}
                onNavigateBack={() => navigate("/dashboard")}
            />
        </div>
    );
}

export default RetroBoardPage;