import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useToast } from "../ToastProvider";
import { useConfirm } from "../ConfirmProvider";
import patchCard from "../../api/patch-card";
import deleteCard from "../../api/delete-card";
import VoteButton from "./VoteButton";
import TagSelector from "./TagSelector";
import { getTagColor } from "../../utils/tag-colors";
import "./CardModal.css";

function CardModal({
    card,
    columnColor,
    columnTitle,
    isOpen,
    remainingVotes,
    availableTags = [],
    onClose,
    onEdit,
    onDelete,
    onVoteChange,
    onTagsChange,
}) {
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editText, setEditText] = useState("");
    const { auth } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();

    // Check if current user is the card creator
    const isOwner = auth.user?.id === card?.created_by?.id || 
                    auth.user?.username === card?.created_by?.username;

    // Reset edit state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setEditText(card?.content || "");
            setIsEditingContent(false);
        }
    }, [isOpen, card?.content]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (isEditingContent) {
                    setIsEditingContent(false);
                    setEditText(card?.content || "");
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isEditingContent, card?.content, onClose]);

    if (!isOpen || !card) return null;

    // Save edited content
    const handleSaveContent = async () => {
        if (editText.trim() && editText.trim() !== card.content) {
            try {
                const updatedCard = await patchCard(
                    card.id,
                    { content: editText.trim() },
                    auth.token
                );
                onEdit(updatedCard.content);
            } catch (error) {
                console.error("Failed to update card:", error);
                showToast("Failed to update card. Please try again.", "error");
            }
        }
        setIsEditingContent(false);
    };

    // Delete card
    const handleDelete = async () => {
        const confirmDelete = await confirm({
            title: 'Delete Card',
            message: 'Are you sure you want to delete this card? This cannot be undone.'
        });

        if (confirmDelete) {
            try {
                await deleteCard(card.id, auth.token);
                onDelete();
                onClose();
            } catch (error) {
                console.error("Failed to delete card:", error);
                showToast("Failed to delete card. Please try again.", "error");
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
            showToast("Failed to update tags. Please try again.", "error");
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="card-modal-overlay" onClick={onClose}>
            <div 
                className="card-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ '--column-color': columnColor || '#e5e7eb' }}
            >
                {/* Header */}
                <div className="card-modal__header">
                    <div className="card-modal__column-indicator">
                        <span 
                            className="card-modal__column-dot"
                            style={{ backgroundColor: columnColor }}
                        />
                        <span className="card-modal__column-name">{columnTitle || 'Card'}</span>
                    </div>
                    <button 
                        className="card-modal__close"
                        onClick={onClose}
                        title="Close (Esc)"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="card-modal__body">
                    {/* Card Content Section */}
                    <div className="card-modal__section">
                        <div className="card-modal__section-header">
                            <span className="material-icons">notes</span>
                            <h3>Content</h3>
                            {isOwner && !isEditingContent && (
                                <button 
                                    className="card-modal__edit-btn"
                                    onClick={() => setIsEditingContent(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        
                        {isEditingContent ? (
                            <div className="card-modal__content-edit">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    autoFocus
                                    placeholder="Enter card content..."
                                    className="card-modal__textarea"
                                />
                                <div className="card-modal__edit-actions">
                                    <button 
                                        className="card-modal__icon-btn card-modal__icon-btn--save"
                                        onClick={handleSaveContent}
                                        title="Save"
                                    >
                                        <span className="material-icons">check</span>
                                    </button>
                                    <button 
                                        className="card-modal__icon-btn card-modal__icon-btn--cancel"
                                        onClick={() => {
                                            setIsEditingContent(false);
                                            setEditText(card.content || "");
                                        }}
                                        title="Cancel"
                                    >
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p 
                                className={`card-modal__content ${isOwner ? 'editable' : ''}`}
                                onClick={isOwner ? () => setIsEditingContent(true) : undefined}
                            >
                                {card.content || (isOwner ? "Click to add content..." : "No content")}
                            </p>
                        )}
                    </div>

                    {/* Tags Section */}
                    <div className="card-modal__section">
                        <div className="card-modal__section-header">
                            <span className="material-icons">label</span>
                            <h3>Tags</h3>
                        </div>
                        
                        {isOwner ? (
                            <TagSelector
                                selectedTags={card.tags || []}
                                availableTags={availableTags}
                                onTagsChange={handleTagsChange}
                            />
                        ) : (
                            <div className="card-modal__tags-display">
                                {card.tags?.length > 0 ? (
                                    card.tags.map(tag => {
                                        return (
                                            <span
                                                key={tag.id}
                                                className="card-modal__tag"
                                            >
                                                {tag.display_name}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span className="card-modal__no-tags">No tags</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Votes Section */}
                    <div className="card-modal__section">
                        <div className="card-modal__votes">
                            <span className="material-icons">thumb_up</span>
                            <span className="card-modal__vote-count">
                                {card.vote_count || 0} {card.vote_count === 1 ? 'vote' : 'votes'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="card-modal__footer">
                    <div className="card-modal__meta">
                        <span className="card-modal__author">
                            <span className="material-icons">person</span>
                            {card.is_anonymous ? "Anonymous" : (card.created_by?.username || "Unknown")}
                        </span>
                        {card.created_at && (
                            <span className="card-modal__date">
                                <span className="material-icons">schedule</span>
                                {formatDate(card.created_at)}
                            </span>
                        )}
                    </div>
                    
                    <button 
                        className="card-modal__delete-btn"
                        onClick={handleDelete}
                        title="Delete Card"
                    >
                        <span className="material-icons">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardModal;
