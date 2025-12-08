import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import Board from "../components/boards/Board";
import getBoardById from "../api/get-board";
import "./RetroBoardPage.css";

function RetroBoardPage() {
    const { id } = useParams(); // Changed from boardId to id to match route
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
                
                // implemented API call
                const response = await getBoardById(id, auth.token);
                
                setBoardState({
                    data: response,
                    isLoading: false,
                    error: ""
                });
                
            } catch (error) {
                setBoardState({
                    data: null,
                    isLoading: false,
                    error: error.message || "Failed to load board. Please try again."
                });
            }
        }

        if (id && auth.token) {
            fetchBoard();
        }
    }, [id, auth.token]);

    function handleBoardUpdate(updatedBoardData) {
        // Support both direct updates and functional updates
        if (typeof updatedBoardData === 'function') {
            setBoardState(prev => ({
                ...prev,
                data: updatedBoardData(prev.data)
            }));
        } else {
            setBoardState(prev => ({
                ...prev,
                data: updatedBoardData
            }));
        }
    }

    if (boardState.isLoading) {
        return (
            <div className="retro-board-page">
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
            </div>
        );
    }

    if (boardState.error) {
        return (
            <div className="retro-board-page">
                <div className="error-container">
                    <p className="error">{boardState.error}</p>
                    <button 
                        className="retro-page-btn retro-page-btn-primary"
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
                        className="retro-page-btn retro-page-btn-primary"
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