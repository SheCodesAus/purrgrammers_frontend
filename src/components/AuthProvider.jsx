import { createContext, useState, useEffect } from 'react';

// create context here
export const AuthContext = createContext();

// component to wrap our app
export function AuthProvider({ children }) {
    const [auth, setAuth] = useState({
        token: localStorage.getItem("token"),
        user: null
    });

    const login = async (username, password) => {
        try {
            const url = `${import.meta.env.VITE_API_URL}/api/token/`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.access || data.token);
                setAuth({
                    token: data.access || data.token,
                    user: { username } 
                });
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.detail || "Login failed" };
            }
        } catch (error) {
            return { success: false, error: "Network error" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setAuth({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}