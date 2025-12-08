import { useState } from "react";
import { voteCard, removeVote } from "../../api/vote-card.js";
import { useAuth } from "../../hooks/use-auth.js";
import { useToast } from "../ToastProvider.jsx";
import "./VoteButton.css";

function VoteButton({ card, remainingVotes, maxVotesPerCard = null, votingEnabled = true, onVoteChange }) {
    const { auth } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Check if user hit per-card limit
    const atCardLimit = maxVotesPerCard !== null && (card.user_vote_count || 0) >= maxVotesPerCard;
    
    // Cannot vote if: no votes left, voting not enabled, or at per-card limit
    const cannotVote = remainingVotes === 0 || !votingEnabled || atCardLimit;

    // Determine the appropriate tooltip
    const getTooltip = () => {
        if (!votingEnabled) return "Voting hasn't started yet";
        if (atCardLimit) return `Max ${maxVotesPerCard} vote${maxVotesPerCard === 1 ? '' : 's'} per card`;
        if (remainingVotes === 0) return "No votes remaining";
        return "Vote for this card";
    };

    const handleVote = async () => {
        if (isLoading || cannotVote) return;

        // Optimistic update - immediately show the vote
        const optimisticData = {
            ...card,
            vote_count: (card.vote_count || 0) + 1,
            user_vote_count: (card.user_vote_count || 0) + 1
        };
        onVoteChange(optimisticData);
        
        setIsLoading(true);
        try {
            const data = await voteCard(card.id, auth.token);
            // Update with real server data (in case of any discrepancy)
            onVoteChange(data);
        } catch (error) {
            // Rollback on error
            onVoteChange(card);
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveVote = async () => {
        if (isLoading || card.user_vote_count === 0) return;

        // Optimistic update - immediately remove the vote
        const optimisticData = {
            ...card,
            vote_count: Math.max((card.vote_count || 0) - 1, 0),
            user_vote_count: Math.max((card.user_vote_count || 0) - 1, 0)
        };
        onVoteChange(optimisticData);

        setIsLoading(true);
        try {
            const data = await removeVote(card.id, auth.token);
            onVoteChange(data);
        } catch (error) {
            // Rollback on error
            onVoteChange(card);
            showToast(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="vote-button-container">
            <button 
                className={`vote-button ${card.user_vote_count > 0 ? "voted" : ""} ${!votingEnabled ? "voting-disabled" : ""} ${atCardLimit ? "at-card-limit" : ""}`}
                onClick={handleVote} 
                disabled={cannotVote}
                title={getTooltip()}
            >
                <span className="material-icons vote-icon">thumb_up</span>
                <span className="vote-count">{card.vote_count || 0}</span>
            </button>
            {card.user_vote_count > 0 && (
                <button 
                    className="remove-vote-button"
                    onClick={handleRemoveVote}
                    disabled={false}
                    title="Remove your vote"
                >
                    −
                </button>
            )}
        </div>
    );
}

export default VoteButton;