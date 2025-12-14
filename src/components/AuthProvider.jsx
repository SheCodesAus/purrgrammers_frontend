import { createContext, useState, useEffect } from 'react';
import posthog from 'posthog-js';

// create context here
export const AuthContext = createContext();

// component to wrap our app
export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: window.localStorage.getItem("token"),
        user: JSON.parse(window.localStorage.getItem("user")) || null
    });

    const isLoggedIn = !!auth.token; // true if token exists

    // Identify user with PostHog when auth changes
    useEffect(() => {
        if (auth.user) {
            posthog.identify(auth.user.id?.toString(), {
                email: auth.user.email,
                username: auth.user.username,
            });
        }
    }, [auth.user]);

    // Move login function out of AuthProvider - handle it in LoginForm
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ token: null, user: null });
        posthog.reset(); // Reset PostHog on logout
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, isLoggedIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}