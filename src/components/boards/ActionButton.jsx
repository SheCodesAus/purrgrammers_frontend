import {useState} from 'react'; // Importing useState from React for managing component state, useState is a hook that lets your component "remember" things between renders. Hooks are special functions that let you "hook into" React features. They let you use state and other React features in function coomponents.
import './ActionButton.css';

function ActionButton(){

    const [showActionForm, setShowActionForm] = useState(false);  // useState is set as false initially, so the form is hidden. 
    const [actionText, setActionText] = useState(''); // useState is set as an empty string initially, so no text is shown.
    const [actionItems, setActionItems] = useState([]); // useState is set as an empty array initially, so no action items are shown.

    return (
        <div className="action-button-container">
            {!showActionForm ? (
                <button
                    className="btn-action"
                    onClick={() => setShowActionForm(true)}
                >
                    Action Items
                </button>
            ) : (
                <div className="action-form">
                    {actionItems.length > 0 && (
                        <div className="action-items-list">
                            <h4 >Action Items:</h4>
                            <ul >
                                {actionItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )} 
                    <textarea
                        value={actionText}
                        onChange={(e) => setActionText(e.target.value)}
                        placeholder="Enter action point..."
                        className="action-input"
                        rows="3"
                />
                    <div className="action-form-buttons">
                        <button
                            type="button"
                            className="btn-small"
                            onClick={() => {
                                if (actionText.trim()) {
                                    setActionItems([...actionItems, actionText]);
                                    setActionText('');
                                }
                            }}
                        >
                            Add
                        </button>

                        <button
                            type="button"
                            className="btn-small"
                            onClick={() => {
                                setActionText('');
                                setShowActionForm(false);
                            }}
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}    
        </div>
    )
}

export default ActionButton;