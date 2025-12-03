import { useState } from 'react';
import './ControlPanel.css';

function ControlPanel({
    dragState,
    isCreatingCard,
    onDragStart,
    onDragEnd,
    onAddColumn,
    boardId,
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleExport = (format) => {
        // Placeholder for export functionality
        alert(`Export to ${format.toUpperCase()} coming soon!`);
    };

    const handleViewReports = () => {
        // Placeholder - will navigate to reports page
        alert('Reports page coming soon!');
    };

    if (isCollapsed) {
        return (
            <div className="control-panel control-panel--collapsed">
                <button 
                    className="control-panel__expand-btn"
                    onClick={() => setIsCollapsed(false)}
                >
                    <span className="material-icons">expand_less</span>
                    <span>Control Panel</span>
                </button>
            </div>
        );
    }

    return (
        <div className="control-panel">
            {/* Collapse Button */}
            <button 
                className="control-panel__collapse-btn"
                onClick={() => setIsCollapsed(true)}
                title="Collapse panel"
            >
                <span className="material-icons">expand_more</span>
            </button>

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
