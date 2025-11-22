import { createContext, useState, useEffect } from 'react';

// create context here
export const AuthContext = createContext();

// component to wrap our app
export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: window.localStorage.getItem("token"),
        user: JSON.parse(window.localStorage.getItem("user")) || null
    });

    const isLoggedIn = !!auth.token; // true if token exists

    // Move login function out of AuthProvider - handle it in LoginForm
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuth({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, isLoggedIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}