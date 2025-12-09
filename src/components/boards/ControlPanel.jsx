import { useState } from 'react';
import { useToast } from '../ToastProvider';
import './ControlPanel.css';

const BASE_URL = import.meta.env.VITE_API_URL;

function ControlPanel({
    dragState,
    isCreatingCard,
    onDragStart,
    onDragEnd,
    onAddColumn,
    boardId,
    token,
    onShowReport,
    currentVotingRound,
    remainingVotes,
    maxVotesPerRound,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { showToast } = useToast();

    const handleExportCSV = async () => {
        if (!boardId || !token) {
            showToast('Unable to export - missing board info');
            return;
        }
        
        const url = `${BASE_URL}/api/retro-boards/${boardId}/report/?format=csv`;
        console.log('CSV Export - URL:', url);
        console.log('CSV Export - Token:', token ? 'present' : 'missing');
        
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: token,
                },
            });
            
            console.log('CSV Export - Response status:', response.status);
            console.log('CSV Export - Content-Type:', response.headers.get('content-type'));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('CSV Export - Error response:', errorText);
                throw new Error('Failed to download report');
            }
            
            // Get the blob and trigger download
            const blob = await response.blob();
            console.log('CSV Export - Blob size:', blob.size, 'type:', blob.type);
            
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `board_${boardId}_report.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            a.remove();
            
            showToast('CSV report downloaded!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showToast('Failed to download CSV report');
        }
    };

    const handleViewReports = () => {
        if (onShowReport) {
            onShowReport();
        }
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
                {currentVotingRound ? (
                    <div className="control-panel__voting-info control-panel__voting-info--active">
                        <div className="control-panel__voting-indicator">
                            <span className="voting-pulse"></span>
                            <span className="voting-live-text">LIVE</span>
                        </div>
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
                            <span>Voting not started</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="control-panel__divider" />

            {/* Columns Section */}
            <div className="control-panel__section">
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

            {/* Cards Section */}
            <div className="control-panel__section">
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

            {/* Reports Section */}
            <div className="control-panel__section">
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
