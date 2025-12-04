import { createContext, useContext, useState, useCallback } from 'react';

// create context
const ConfirmContext = createContext();

// provider component
export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  // function to show the confirm dialog - returns a Promise (placeholder for a future value)
  const confirm = useCallback(({ title = 'Confirm', message }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        onConfirm: resolve,  // store the resolve function
      });
    });
  }, []);

  // Handle user clicking on "confirm"
  const handleConfirm = () => {
    confirmState.onConfirm(true);  // resolve promise with true
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // Handle user clicking on "cancel"
  const handleCancel = () => {
    confirmState.onConfirm(false);  // resolve promise with false
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div className="confirm-overlay" onClick={handleCancel}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">{confirmState.title}</h3>
            <p className="confirm-message">{confirmState.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// Custom hook to use confirm anywhere
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}