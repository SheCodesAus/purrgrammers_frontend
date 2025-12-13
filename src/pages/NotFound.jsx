import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="not-found-icon">
                    <span className="material-icons">search_off</span>
                </div>
                <h1 className="not-found-title">404 - Page Not Found</h1>
                <p className="not-found-message">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="not-found-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/')}
                    >
                        <span className="material-icons">home</span>
                        Go Home
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        <span className="material-icons">arrow_back</span>
                        Go Back
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/help')}
                    >
                        <span className="material-icons">help_outline</span>
                        Need Help?
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
