import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import './NavBar.css';
import logo from '../assets/logo-blue-spaced.svg';

function NavBar() {
    const { auth, setAuth } = useAuth();
    const { logout } = useAuth();
    const location = useLocation();
    const isRetroBoardPage = location.pathname.startsWith('/retro-board');
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Add scroll listener for glassmorphism effect
    useEffect(() => {
        const handleScroll = () => {
            // Check both window scroll and app container scroll
            const appContainer = document.querySelector('.app');
            const scrollPosition = window.scrollY || (appContainer ? appContainer.scrollTop : 0);
            setScrolled(scrollPosition > 20);
        };

        // Listen to both window and app container
        const appContainer = document.querySelector('.app');
        window.addEventListener('scroll', handleScroll);
        if (appContainer) {
            appContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (appContainer) {
                appContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, [location.pathname]); // Re-run when route changes

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <nav className={`nav-container ${isRetroBoardPage ? 'nav-gradient' : ''} ${scrolled ? 'scrolled' : ''}`}>   
            <div className='nav-bar'>
                <div className='nav-bar-left'>
                    
                    <Link to="/" className='nav-logo'>
                        <img src={logo} alt="Save Point" className="nav-logo-img" />
                    </Link>   
                </div>

                {/* Hamburger button for mobile */}
                <button 
                    className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                <ul className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
                    <li><NavLink to="/" className={auth?.token ? 'auth-link' : ''} onClick={closeMenu}>Home</NavLink></li>

                    {/* Show login only when not logged in */}
                    {!auth?.token && (
                        <li><NavLink to="/login" className="login-btn" onClick={closeMenu}>Login</NavLink></li>  
                    )}
                    
                    {/* Show Dashboard only when logged in */}
                    {auth?.token && (
                        <li><NavLink to="/dashboard" className="auth-link" onClick={closeMenu}>Dashboard</NavLink></li>
                    )}
                    
                    {/* User display - only when logged in */}
                    {auth?.token && (
                        <li className="nav-user-wrapper">
                            <div className="nav-user-display">
                                <span className="material-icons nav-user-icon">account_circle</span>
                                <span className="nav-user-name">{auth.user?.username}</span>
                            </div>
                        </li>
                    )}
                    
                    {/* Show Logout only when logged in */}
                    {auth?.token && (
                        <li><button onClick={handleLogout} className="logout-btn auth-link">Logout</button></li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;
