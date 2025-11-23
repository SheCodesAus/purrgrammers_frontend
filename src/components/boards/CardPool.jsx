import './CardPool.css';

function CardPool({
    dragState,     // current drag state from board: isDragging, draggedCardType, dragOverColumn
    isCreatingCard, // loading state when creating a card
    onDragStart,   // function to START dragging
    onDragEnd,     // function to end drag
}) {
    return (
        <div className="card-pool">
            <div className="card-pool-header">
                <h4>Card Pool</h4>
                <p>Drag the card below into any column to add it</p>
            </div>

            <div className="draggable-cards">
                <DraggableCard
                    isDragging={dragState.isDragging}
                    isCreatingCard={isCreatingCard}
                    onDragStart={() => onDragStart('generic')} // generic card type
                    onDragEnd={onDragEnd}
                />
            </div>

            {/* Instructions */}
            <div className="pool-instructions">
                {isCreatingCard ? (
                    <p className="creating-hint">Creating card...</p>
                ) : dragState.isDragging ? (
                    <p className="drag-hint">Drop your card into any column above</p>
                ) : (
                    <p className="idle-hint">Drag the card to any column to get started</p>
                )}
            </div>
        </div>
    );
}

// Single generic draggable card
function DraggableCard({ isDragging, isCreatingCard, onDragStart, onDragEnd }) {
    const handleDragStart = (event) => {
        // Set drag data
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', 'generic');

        // Call the parent handler
        onDragStart();
    };

    const handleDragEnd = (event) => {
        onDragEnd();
    };

    return (
        <div
            draggable={!isCreatingCard}  // Disable dragging while creating
            className={`draggable-card ${isCreatingCard ? 'disabled' : ''} generic-card ${isDragging ? 'dragging' : ''}`}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            title="Drag me to any column to add a new card"
        >
            <div className="card-icon">📝</div>
            <div className="card-info">
                <h5 className="card-title">New Card</h5>
                <p>Drag me into any column</p>
            </div>
            <div className="drag-handle">
                <span>⋮⋮</span>
            </div>
        </div>
    );
}

export default CardPool;