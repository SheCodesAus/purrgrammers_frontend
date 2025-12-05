import { useState } from "react";
import { useToast } from "../ToastProvider";
import { useAuth } from "../../hooks/use-auth";
import exportBoard from "../../api/export-board";
import "./ControlPanel.css";

function ControlPanel({
  dragState,
  isCreatingCard,
  onDragStart,
  onDragEnd,
  onAddColumn,
  boardId,
  currentVotingRound,
  remainingVotes,
  maxVotes,
  onStartNewRound,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { showToast } = useToast();
  const { auth } = useAuth();

  const handleExport = async (format) => {
    try {
      // Call the export API
      const blob = await exportBoard(boardId, format, auth.token);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `board-export.${format === "csv" ? "csv" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(`Board exported as ${format.toUpperCase()}!`, "success");
    } catch (error) {
      showToast(`Export failed: ${error.message}`, "error");
    }
  };

  const handleViewReports = () => {
    // Placeholder - will navigate to reports page
    showToast("Reports page coming soon!");
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
    <div className="control-panel-wrapper">
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
          <h4 className="control-panel__section-title">Voting</h4>
          <div className="control-panel__voting-info">
            <div className="control-panel__voting-round">
              <span className="material-icons">how_to_vote</span>
              <span>
                Round{" "}
                {currentVotingRound?.round_number ?? currentVotingRound ?? 1}
              </span>
            </div>
            <div className="control-panel__votes-remaining">
              <span className="votes-count">
                {remainingVotes ?? maxVotes ?? 5}
              </span>
              <span className="votes-label">/ {maxVotes ?? 5} votes left</span>
            </div>
          </div>
          <button
            className="control-panel__btn control-panel__btn--accent"
            onClick={onStartNewRound}
            title="Start a new voting round - everyone gets fresh votes!"
          >
            <span className="material-icons">restart_alt</span>
            New Round
          </button>
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
              onDragStart={() => onDragStart("generic")}
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
              onClick={() => handleExport("csv")}
              title="Export board data as CSV"
            >
              <span className="material-icons">download</span>
              CSV
            </button>
            <button
              className="control-panel__btn control-panel__btn--secondary"
              onClick={() => handleExport("pdf")}
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
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", "generic");
    onDragStart();
  };

  return (
    <div
      draggable={!isCreatingCard}
      className={`control-panel__draggable-card ${
        isCreatingCard ? "disabled" : ""
      } ${isDragging ? "dragging" : ""}`}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      title="Drag me to any column to add a new card"
    >
      <span className="material-icons">note_add</span>
    </div>
  );
}

export default ControlPanel;
