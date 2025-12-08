import { useState } from 'react';
import { useToast } from '../ToastProvider';
import './ControlPanel.css';

function ControlPanel({
    dragState,
    isCreatingCard,
    onDragStart,
    onDragEnd,
    onAddColumn,
    boardId,
    currentVotingRound,
    remainingVotes,
    maxVotesPerRound,
    maxVotesPerCard,
    onVotingSettingsChange,
    onStartVoting,
    isBoardCreator,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showVotingSettings, setShowVotingSettings] = useState(false);
    const [editMaxPerRound, setEditMaxPerRound] = useState(maxVotesPerRound ?? 5);
    const [editMaxPerCard, setEditMaxPerCard] = useState(maxVotesPerCard ?? '');
    const { showToast } = useToast();

    const handleExport = (format) => {
        // Placeholder for export functionality
        showToast(`Export to ${format.toUpperCase()} coming soon!`);
    };

    const handleViewReports = () => {
        // Placeholder - will navigate to reports page
        showToast('Reports page coming soon!');
    };

    const handleSaveVotingSettings = () => {
        const settings = {
            max_votes_per_round: parseInt(editMaxPerRound, 10) || 5,
            max_votes_per_card: editMaxPerCard === '' || editMaxPerCard === null ? null : parseInt(editMaxPerCard, 10)
        };
        onVotingSettingsChange(settings);
        setShowVotingSettings(false);
    };

    if (isCollapsed) {
        return (
            <div className="control-panel-wrapper">
                <button 
                    className="control-panel__expand-tab"
                    onClick={() => setIsCollapsed(false)}
                >
                    <span className="material-icons">expand_less</span>
                    <span>Control Panel</span>
                </button>
            </div>
        );
    }

    return (
        <div 
            className={`control-panel-wrapper ${isMobileOpen ? 'open' : ''}`}
            onClick={(e) => {
                // Toggle when clicking the tab area (::after pseudo-element region)
                const rect = e.currentTarget.getBoundingClientRect();
                if (e.clientX > rect.right - 48) {
                    setIsMobileOpen(!isMobileOpen);
                }
            }}
        >
            {/* Collapse Tab */}
            <button 
                className="control-panel__collapse-tab"
                onClick={() => setIsCollapsed(true)}
                title="Collapse panel"
            >
                <span className="material-icons">expand_more</span>
            </button>
            
            <div className="control-panel">
                {/* Voting Section */}
            <div className="control-panel__section">
                <h4 className="control-panel__section-title">
                    Voting
                    {isBoardCreator && (
                        <button 
                            className="control-panel__settings-btn"
                            onClick={() => setShowVotingSettings(!showVotingSettings)}
                            title="Voting settings"
                        >
                            <span className="material-icons">settings</span>
                        </button>
                    )}
                </h4>
                
                {/* Voting Settings Panel - Board Creator Only */}
                {showVotingSettings && isBoardCreator && (
                    <div className="control-panel__settings-panel">
                        <div className="control-panel__setting-row">
                            <label>Votes per round:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="99"
                                value={editMaxPerRound}
                                onChange={(e) => setEditMaxPerRound(e.target.value)}
                            />
                        </div>
                        <div className="control-panel__setting-row">
                            <label>Max per card:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="99"
                                placeholder="∞"
                                value={editMaxPerCard}
                                onChange={(e) => setEditMaxPerCard(e.target.value)}
                            />
                        </div>
                        <div className="control-panel__setting-actions">
                            <button 
                                className="control-panel__btn control-panel__btn--small"
                                onClick={() => setShowVotingSettings(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="control-panel__btn control-panel__btn--small control-panel__btn--accent"
                                onClick={handleSaveVotingSettings}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
                
                {currentVotingRound ? (
                    <div className="control-panel__voting-info">
                        <div className="control-panel__voting-round">
                            <span className="material-icons">how_to_vote</span>
                            <span>Round {currentVotingRound?.round_number ?? (typeof currentVotingRound === 'number' ? currentVotingRound : 1)}</span>
                        </div>
                        <div className="control-panel__votes-remaining">
                            <span className="votes-count">{remainingVotes ?? maxVotesPerRound ?? 5}</span>
                            <span className="votes-label">/ {maxVotesPerRound ?? 5} votes left</span>
                        </div>
                    </div>
                ) : (
                    <div className="control-panel__voting-info">
                        <div className="control-panel__voting-status">
                            <span className="material-icons">how_to_vote</span>
                            <span>Voting not started</span>
                        </div>
                    </div>
                )}
                {isBoardCreator && (
                    <button 
                        className="control-panel__btn control-panel__btn--accent"
                        onClick={onStartVoting}
                        title={currentVotingRound ? "Start a new voting round - everyone gets fresh votes!" : "Start voting for this board"}
                    >
                        <span className="material-icons">{currentVotingRound ? 'restart_alt' : 'play_arrow'}</span>
                        {currentVotingRound ? `Start Round ${(currentVotingRound?.round_number ?? (typeof currentVotingRound === 'number' ? currentVotingRound : 1)) + 1}` : 'Start Voting'}
                    </button>
                )}
            </div>

            {/* Divider */}
            <div className="control-panel__divider" />

            {/* Cards Section */}
            <div className="control-panel__section">
                <h4 className="control-panel__section-title">Add Cards</h4>
                <div className="control-panel__card-area">
                    <DraggableCard
                        isDragging={dragState.isDragging}
                        isCreatingCard={isCreatingCard}
                        onDragStart={() => onDragStart('generic')}
                        onDragEnd={onDragEnd}
                    />
                    <div className="control-panel__card-hint">
                        {isCreatingCard ? (
                            <span className="hint--creating">Creating card...</span>
                        ) : dragState.isDragging ? (
                            <span className="hint--dragging">Drop into a column</span>
                        ) : (
                            <span className="hint--idle">Drag to any column</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="control-panel__divider" />

            {/* Columns Section */}
            <div className="control-panel__section">
                <h4 className="control-panel__section-title">Columns</h4>
                <button 
                    className="control-panel__btn control-panel__btn--primary"
                    onClick={onAddColumn}
                >
                    <span className="material-icons">add</span>
                    Add Column
                </button>
            </div>

            {/* Divider */}
            <div className="control-panel__divider" />

            {/* Reports Section */}
            <div className="control-panel__section">
                <h4 className="control-panel__section-title">Reports</h4>
                <div className="control-panel__btn-group">
                    <button 
                        className="control-panel__btn control-panel__btn--secondary"
                        onClick={() => handleExport('csv')}
                        title="Export board data as CSV"
                    >
                        <span className="material-icons">download</span>
                        CSV
                    </button>
                    <button 
                        className="control-panel__btn control-panel__btn--secondary"
                        onClick={() => handleExport('pdf')}
                        title="Export board as PDF"
                    >
                        <span className="material-icons">picture_as_pdf</span>
                        PDF
                    </button>
                    <button 
                        className="control-panel__btn control-panel__btn--secondary"
                        onClick={handleViewReports}
                        title="View detailed reports"
                    >
                        <span className="material-icons">analytics</span>
                        Reports
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}

// Draggable card component
function DraggableCard({ isDragging, isCreatingCard, onDragStart, onDragEnd }) {
    const handleDragStart = (event) => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', 'generic');
        onDragStart();
    };

    return (
        <div
            draggable={!isCreatingCard}
            className={`control-panel__draggable-card ${isCreatingCard ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
            title="Drag me to any column to add a new card"
        >
            <span className="material-icons">note_add</span>
        </div>
    );
}

export default ControlPanel;
