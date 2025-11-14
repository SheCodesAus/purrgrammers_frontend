import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';

function LoginForm() {
    const [credentials, setCredentials] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();

    const handleChange = (event) => {
        const { id, value } = event.target;
        setCredentials((prevCredentials) => ({
            ...prevCredentials,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        
        if (credentials.username && credentials.password) {
            try {
                const result = await login(credentials.username, credentials.password);
                if (result.success) {
                    console.log("Login successful!");
                    // Redirect or show success message
                } else {
                    setError(result.error || "Login failed");
                }
            } catch (err) {
                setError("Login failed. Please try again.");
            }
        } else {
            setError("Please enter both username and password");
        }
        setLoading(false);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h1>Login</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type='text'
                        id='username'
                        value={credentials.username}
                        placeholder='Enter username'
                        onChange={handleChange}
                        disabled={loading}
                     />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password"
                        id="password" 
                        value={credentials.password}
                        placeholder="Enter password"
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>
                <button type='submit' disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;