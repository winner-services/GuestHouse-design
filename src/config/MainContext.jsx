import React, { createContext, useState, useEffect } from 'react';

const MainContext = createContext({
    user: null,
    permissions:[],
    role:null,
    isAuthenticated: false,
    setToken: () => {},
    logout: () => {},
    loader:false,
});

const MainProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log("token:",token)
        if (token) {
            console.log("token VALIDATED:",token)
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    const setToken = (token, user, permissions,role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(permissions));
        localStorage.setItem('role', JSON.stringify(role));
        setUser(user);
        setPermissions(permissions);
        setRole(role);
        setIsAuthenticated(true); // Update isAuthenticated here
    };

    const logout = async () => {
        try {
            setLoader(true)
            const response = await fetch(`${BaseUrl}/auth/logout`, {
                method: 'GET',
                headers: headerRequest
            });
            const res = await response.json();
            if (res.status == 200) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permissions');
                localStorage.removeItem('role');
                setUser(null);
                setPermissions([]);
                setIsAuthenticated(false);
                location.href = "/"
            }
            setLoader(false)
        } catch (error) {
            console.error(error); // Handle logout errors gracefully
            setLoader(false)
        }
    };

    return (
        <MainContext.Provider value={{ user, isAuthenticated, setToken, logout, loader, setLoader,permissions }}>
            {children}
        </MainContext.Provider>
    );
};

export { MainContext, MainProvider };