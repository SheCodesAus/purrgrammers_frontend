import './HomePage.css';

function HomePage() {
    return (
        <div className='homepage-container'>
            <div className='hero-section'>
                <h1 className='hero-title'>Welcome to Save Point</h1>
                <p className='hero-subtitle'>Streamline your team retrospectives with collaborative boards</p>
                <div className='cta-buttons'>
                    <button className='btn btn-primary'>Get Started</button>
                    <button className='btn btn-secondary'>Learn More</button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;