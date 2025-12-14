import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../ToastProvider";
import { useConfirm } from "../ConfirmProvider";
import patchCard from "../../api/patch-card";
import deleteCard from "../../api/delete-card";
import VoteButton from "./VoteButton";
import CardModal from "./CardModal";
import "./Card.css";

function Card({
    card,
    columnType,
    columnColor,
    columnTitle,
    isEditing,
    remainingVotes,
    maxVotesPerCard,
    votingEnabled,
    availableTags = [],
    canDeleteAnyCard = false,
    onEdit,
    onDelete,
    onVoteChange,
    onTagsChange,
    onCancelEdit
}) {
    const [editText, setEditText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const tagDropdownRef = useRef(null);
    const dropdownPortalRef = useRef(null);
    const addButtonRef = useRef(null);
    const { auth } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Close tag dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            // Check both the wrapper ref and the portal dropdown ref
            const clickedInWrapper = tagDropdownRef.current && tagDropdownRef.current.contains(e.target);
            const clickedInDropdown = dropdownPortalRef.current && dropdownPortalRef.current.contains(e.target);
            
            if (!clickedInWrapper && !clickedInDropdown) {
                setIsTagSelectorOpen(false);
            }
        };

        if (isTagSelectorOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isTagSelectorOpen]);

    // Truncate text to ~100 characters with "... see more"
    const MAX_LENGTH = 100;
    // Normalize whitespace: replace multiple spaces/newlines with single space
    const normalizedContent = card.content?.replace(/\s+/g, ' ').trim() || "";
    const shouldTruncate = normalizedContent.length > MAX_LENGTH;
    
    let displayText;
    if (shouldTruncate) {
        // Find the last space before MAX_LENGTH to avoid cutting mid-word
        const truncated = normalizedContent.slice(0, MAX_LENGTH);
        const lastSpace = truncated.lastIndexOf(' ');
        displayText = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
    } else {
        displayText = normalizedContent || "Click to view";
    }

    
    // Check if current user is the card creator
    const isOwner = auth.user?.id === card.created_by?.id || 
                    auth.user?.username === card.created_by?.username;

    // Save edited text
    const handleSave = async () => {
        if (editText.trim()) {
            try {
                const updatedCard = await patchCard(
                    card.id,
                    { content: editText.trim() },
                    auth.token
                );
                // Pass just the content string, not the full card object
                onEdit(updatedCard.content);
            } catch (error) {
                console.error("Failed to update card:", error);
                onCancelEdit(); // Fall back to cancel if error
            }
        } else {
            onCancelEdit();
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditText("");
        onCancelEdit();
    };

    // delete card
    const handleDelete = async () => {
        const confirmDelete = await confirm({
            title: 'Delete Card',
            message: 'Delete card?'
        });

        if (confirmDelete) {
            try {
                await deleteCard(card.id, auth.token);
                onDelete(); //call the existing onDelete prop to update parent state
            } catch (error) {
                console.error("Failed to delete card:", error);
                showToast("Failed to delete card. Please try again");
            }
        }
    };

    // Handle tag changes
    const handleTagsChange = async (newTags) => {
        try {
            const tagIds = newTags.map(t => t.id);
            const updatedCard = await patchCard(
                card.id,
                { tag_ids: tagIds },
                auth.token
            );
            if (onTagsChange) {
                onTagsChange(updatedCard);
            }
        } catch (error) {
            console.error("Failed to update tags:", error);
            showToast("Failed to update tags. Please try again.");
        }
    };

    if (isEditing) {
        return (
            <div 
                className={`card editing ${columnType}`}
                style={{
                    backgroundColor: columnColor || undefined
                }}
            >
                <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // stop enter from adding new line
                            handleSave();
                        }
                        if (e.key === 'Escape') {
                            handleCancel();
                        }
                    }}
                    onBlur={handleSave}
                    autoFocus
                    placeholder="Enter your card text..."
                    className="card-edit-textarea"
                />
                <div className="edit-actions">
                    <button 
                        onClick={handleSave}
                        className="save-btn"
                        title="Save"
                    >
                        ✓
                    </button>
                    <button 
                        onClick={handleCancel}
                        className="cancel-btn"
                        title="Cancel"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div 
                className={`card ${columnType} ${isOwner ? 'editable' : ''}`}
                style={{
                    backgroundColor: columnColor || undefined
                }}
                draggable={true}
                onDragStart={(e) => {
                    e.dataTransfer.setData('cardId', card.id.toString());
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => setIsModalOpen(true)}
            >
                {/* Only show delete button if user owns the card or can delete any card */}
                {(isOwner || canDeleteAnyCard) && (
                    <button 
                        className="card-delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        title="Delete card"
                    >
                        <span className="material-icons">close</span>
                    </button>
                )}
                
                <div className="card-content">
                    <p className="card-text">
                        {displayText}
                        {shouldTruncate && (
                            <span className="card-read-more"> ... see more</span>
                        )}
                    </p>
                </div>

                {/* Tag count badge - compact display */}
                {card.tags && card.tags.length > 0 && (
                    <div className="card-tags-badge">
                        <span className="material-icons">local_offer</span>
                        <span>{card.tags.length}</span>
                    </div>
                )}

                <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                    <div className="card-meta">
                        <span className={`card-author ${card.is_anonymous ? 'anonymous' : ''}`}>
                            {card.is_anonymous ? "Anonymous" : (card.created_by?.username || card.created_by?.initials || card.author || "Anonymous")}
                        </span>
                    </div>

                    <VoteButton
                        card={card}
                        remainingVotes={remainingVotes}
                        maxVotesPerCard={maxVotesPerCard}
                        votingEnabled={votingEnabled}
                        onVoteChange={onVoteChange}
                    />
                </div>
            </div>

            {/* Card Modal - rendered via portal to escape column overflow */}
            {isModalOpen && createPortal(
                <CardModal
                    card={card}
                    columnColor={columnColor}
                    columnTitle={columnTitle}
                    isOpen={isModalOpen}
                    remainingVotes={remainingVotes}
                    maxVotesPerCard={maxVotesPerCard}
                    votingEnabled={votingEnabled}
                    availableTags={availableTags}
                    onClose={() => setIsModalOpen(false)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onVoteChange={onVoteChange}
                    onTagsChange={onTagsChange}
                />,
                document.body
            )}
        </>
    );
}

export default Card;
