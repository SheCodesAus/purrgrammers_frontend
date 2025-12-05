import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import './NavBar.css';
import logo from '../assets/logo-2.svg';

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
                <div className='nav-bar-left'>
                    
                    <Link to="/" className='nav-logo'>
                        <img src={logo} alt="Save Point" className="nav-logo-img" />
                    </Link>   
                </div>
                <ul className='nav-links'>
                    <li><NavLink to="/" className={auth?.token ? 'auth-link' : ''}>Home</NavLink></li>

                    {/* Show login only when not logged in */}
                    {!auth?.token && (
                        <li><NavLink to="/login" className="login-btn">Login</NavLink></li>  
                    )}
                    
                    {/* Show Dashboard only when logged in */}
                    {auth?.token && (
                        <li><NavLink to="/dashboard" className="auth-link">Dashboard</NavLink></li>
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
