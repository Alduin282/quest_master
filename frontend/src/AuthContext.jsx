import React, { createContext, useState, useContext, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch user profile to verify token
            api.get('quests/') // Temporary check, ideally we have a /me endpoint
                .then(() => {
                    // If succeeds, we assume the user is "logged in" for now
                    // We can store a generic user object or fetch real user data if we added a serializer for it
                    setUser({ username: localStorage.getItem('username') });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const response = await api.post('../api-token-auth/', { username, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setUser({ username });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
