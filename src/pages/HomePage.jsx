import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();
    const { auth } = useAuth();

    const scrollToFeatures = () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className='homepage-container'>
            {/* Hero Section */}
            <section className='hero-section'>
                <h1 className='hero-title'>Welcome to Save Point</h1>
                <p className='hero-subtitle'>Where your teams level up every sprint</p>
            </section>

            {/* Features Section */}
            <section id="features" className='features-section'>
                <div className='features-grid'>
                    <div className='feature-card'>
                        <span className='feature-icon material-icons'>groups</span>
                        <h3 className='feature-title'>Reflect Together</h3>
                        <p className='feature-description'>Create a safe space for your team to share wins, challenges, and ideas.</p>
                    </div>
                    <div className='feature-card'>
                        <span className='feature-icon material-icons'>sync</span>
                        <h3 className='feature-title'>Collaborate in Real-Time</h3>
                        <p className='feature-description'>See updates instantly as your team adds cards, votes, and comments.</p>
                    </div>
                    <div className='feature-card'>
                        <span className='feature-icon material-icons'>trending_up</span>
                        <h3 className='feature-title'>Improve Each Sprint</h3>
                        <p className='feature-description'>See patterns, follow up on action items, and improve your team one sprint at a time</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='cta-section'>
                <p className='cta-text'>Because your team deserves more than a wall of sad Post-it notes</p>
                <button className='btn btn-primary' onClick={() => navigate(auth?.token ? '/dashboard' : '/login')}>
                    {auth?.token ? 'Go to Dashboard' : 'Get Started'}
                </button>
            </section>
        </div>
    );
}

export default HomePage;