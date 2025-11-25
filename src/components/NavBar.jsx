import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import './NavBar.css';

function NavBar() {
    const { auth, setAuth } = useAuth();
    const { logout } = useAuth();

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

                    
                    {/* Show Logout only when logged in */}
                    {auth?.token && (
                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;

// TODO: Login states:
// when logged out: Home, login, signup
// when logged in: dashboard, my boards, {username} logout
// when admin user: also shows teams, and analytics
