import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import './NavBar.css';
import TeamsModal from './TeamsModal';

function NavBar() {
    const { auth, setAuth } = useAuth();
    const { logout } = useAuth();
    const [showTeamsModal, setShowTeamsModal] = useState(false);

    const handleLogout = () => {
        logout();
        // Token is automatically cleared from localStorage
        // User state is reset to null
    };

    return (
        <nav className='nav-container'> {/* semantic HTML for accessibility and SEO benefits*/}    
            <div className='nav-bar'>
                <ul className='nav-links'>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>

                    {/* Show login only when not logged in */}
                    {!auth?.token && (
                        <li><NavLink to="/login">Login</NavLink></li>  
                    )}
                    
                    {/* Show Dashboard only when logged in */}
                    {auth?.token && (
                        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                    )}

                    {/* Show Teams only when logged in */}
                    {auth?.token && (
                        <li>
                            <button 
                                onClick={() => setShowTeamsModal(true)} 
                                className="nav-btn"
                            >
                                Teams
                            </button>
                        </li>
                    )}
                    
                    {/* Show Logout only when logged in */}
                    {auth?.token && (
                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                    )}
                </ul>
            </div>

            <TeamsModal 
                isOpen={showTeamsModal} 
                onClose={() => setShowTeamsModal(false)} 
            />
        </nav>
    );
}

export default NavBar;
