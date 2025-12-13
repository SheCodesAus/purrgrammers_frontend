import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-page">
                    <div className="error-content">
                        <div className="error-icon">
                            <span className="material-icons">error_outline</span>
                        </div>
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">
                            We're experiencing a temporary issue. Our team has been notified and we're working to fix it.
                        </p>
                        <div className="error-actions">
                            <button 
                                className="btn btn-primary"
                                onClick={() => window.location.href = '/'}
                            >
                                Return Home
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => window.location.href = '/help'}
                            >
                                Get Help
                            </button>
                        </div>
                        <p className="error-footer">
                            If this issue persists, please contact support or try again later.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
