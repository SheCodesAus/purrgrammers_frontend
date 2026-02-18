import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { getBoardByInviteCode, joinBoard } from "../api/join-board";
import "./JoinPage.css";

function JoinPage() {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();

    const [displayName, setDisplayName] = useState(
        localStorage.getItem("guest_display_name") || ""
    );
    const [boardInfo, setBoardInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");

    // Fetch board info on mount
    useEffect(() => {
        async function fetchBoardInfo() {
            try {
                const data = await getBoardByInviteCode(inviteCode);
                setBoardInfo(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchBoardInfo();
    }, [inviteCode]);

    const handleJoin = async (e) => {
        e.preventDefault();
        setIsJoining(true);
        setError("");

        try {
            const response = await joinBoard(inviteCode, displayName, auth?.token);

            // If we got back auth data (guest flow), store it
            if (response.token && response.user) {
                const token = `Token ${response.token}`;
                window.localStorage.setItem("token", token);
                window.localStorage.setItem("user", JSON.stringify(response.user));
                setAuth({ token, user: response.user });
            }

            // Remember the display name for next time
            if (displayName) {
                localStorage.setItem("guest_display_name", displayName);
            }

            navigate(`/retro-board/${response.board_id}`, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return (
            <div className="join-page">
                <div className="join-container">
                    <div className="join-loading">Loading...</div>
                </div>
            </div>
        );
    }

    if (error && !boardInfo) {
        return (
            <div className="join-page">
                <div className="join-container">
                    <div className="join-card">
                        <span className="material-icons join-error-icon">error_outline</span>
                        <h1>Invalid Invite Link</h1>
                        <p className="join-subtitle">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="join-page">
            <div className="join-container">
                <div className="join-card">
                    <h1>Join Retro Board</h1>
                    <p className="join-board-name">{boardInfo?.board_title}</p>
                    {boardInfo?.team_name && (
                        <p className="join-team-name">
                            <span className="material-icons">group</span>
                            {boardInfo.team_name}
                        </p>
                    )}

                    <form onSubmit={handleJoin}>
                        {auth?.token ? (
                            <p className="join-auth-info">
                                Joining as <strong>{auth.user?.first_name || auth.user?.username}</strong>
                            </p>
                        ) : (
                            <input
                                type="text"
                                placeholder="Enter your display name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                disabled={isJoining}
                                required
                                autoFocus
                            />
                        )}

                        {error && <span className="error-message">{error}</span>}

                        <button type="submit" disabled={isJoining || (!auth?.token && !displayName.trim())}>
                            {isJoining ? "Joining..." : "Join Board"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default JoinPage;
