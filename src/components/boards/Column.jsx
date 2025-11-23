import Card from "./Card";
import './Column.css';

function Column({
    column,
    currentUser,
    dragState,
    editingCard,
    onEditCard,
    onDeleteCard,
    onSetEditingCard,
    onDragOver,
    onDrop,
    onDragEnter,
    onDragLeave
}) {
    return (
        <div 
            className={`retro-column ${column.column_type} ${
                dragState.dragOverColumn === column.id ? 'drag-over' : ''
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnter={onDragEnter}
        >
            <div className="column-header">
                <h3 className="column-title">{column.title}</h3>
                <div className="column-count">
                    {column.cards?.length || 0} cards
                </div>
            </div>

            <div className="column-content">
                <div className="cards-list">
                    {column.cards?.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            columnType={column.column_type}
                            currentUser={currentUser}
                            isEditing={editingCard === card.id}
                            onEdit={(newText) => onEditCard(card.id, newText)}
                            onDelete={() => onDeleteCard(card.id)}
                            onStartEdit={() => onSetEditingCard(card.id)}
                            onCancelEdit={() => onSetEditingCard(null)}
                        />
                    ))}
                </div>

                {/* Drop zone hint when dragging */}
                {dragState.isDragging && (
                    <div className="drop-zone-hint">
                        Drop your card here
                    </div>
                )}

                {/* Empty state */}
                {!column.cards?.length && !dragState.isDragging && (
                    <div className="empty-column">
                        <p>No cards yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Column;
