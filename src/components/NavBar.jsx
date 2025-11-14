import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import './NavBar.css';

function NavBar() {
    return (
        <nav className='nav-container'> {/* semantic HTML for accessibility and SEO benefits*/}    
            <div className='nav-bar'>
                <ul className='nav-links'>
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/login">Login</NavLink></li>
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
