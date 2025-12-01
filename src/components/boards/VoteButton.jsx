import { useState } from "react";
import { voteCard, removeVote } from "../../api/vote-card.js";
import { useAuth } from "../../hooks/use-auth.js";
import "./VoteButton.css";

function VoteButton({ card, remainingVotes, onVoteChange }) {
    const { auth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleVote = async () => {
        if (isLoading || remainingVotes === 0) return;

        setIsLoading(true);
        try {
            const data = await voteCard(card.id, auth.token);
            onVoteChange(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveVote = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const data = await removeVote(card.id, auth.token);
            onVoteChange(data);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vote-button-container">
            <button 
                className={`vote-button ${card.user_vote_count > 0 ? "voted" : ""}`}
                onClick={handleVote} 
                disabled={isLoading || remainingVotes === 0}
                title={remainingVotes === 0 ? "No votes remaining" : "Vote for this card"}
            >
                <span className="material-icons vote-icon">thumb_up</span>
                <span className="vote-count">{card.vote_count || 0}</span>
            </button>
            {card.user_vote_count > 0 && (
                <button 
                    className="remove-vote-button"
                    onClick={handleRemoveVote}
                    disabled={isLoading}
                    title="Remove your vote"
                >
                    −
                </button>
            )}
        </div>
    );
}

export default VoteButton;