import { createContext, useContext, useState, useCallback } from "react";

// toast buttons replace window messages

// context
const ToastContext = createContext();

// toast provider component - wraps app
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);


    // function to add a new toast
    const showToast = useCallback((message, type = 'info', duration = 4000) => {
       const id = Date.now(); // unique id for each toast
       
       setToasts( prev => [...prev, { id, message, type }]);

       // auto remove after duration
       setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
       }, duration);
    }, []);

    // function to manually dismiss a toast message
    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast container - renders all active toasts */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <span className="toast-message">{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => dismissToast(toast.id)}
                        >
                            x
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}


// custom hook for use anywhere
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context;
}
