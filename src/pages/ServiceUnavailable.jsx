import './ServiceUnavailable.css';

function ServiceUnavailable() {
    return (
        <div className="service-unavailable-page">
            <div className="service-unavailable-content">
                <div className="service-unavailable-icon">
                    <span className="material-icons">cloud_off</span>
                </div>
                <h1 className="service-unavailable-title">Service Temporarily Unavailable</h1>
                <p className="service-unavailable-message">
                    We're performing scheduled maintenance to improve your experience. 
                    The site will be back online shortly.
                </p>
                <div className="service-unavailable-info">
                    <div className="info-item">
                        <span className="material-icons">schedule</span>
                        <span>Expected back soon</span>
                    </div>
                    <div className="info-item">
                        <span className="material-icons">support_agent</span>
                        <span>Our team is working on it</span>
                    </div>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                >
                    <span className="material-icons">refresh</span>
                    Refresh Page
                </button>
                <p className="service-unavailable-footer">
                    Thank you for your patience. We'll be back before you know it!
                </p>
            </div>
        </div>
    );
}

export default ServiceUnavailable;
