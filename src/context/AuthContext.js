// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the initial context values
const AuthContext = createContext({
  isLoggedIn: false,
  userRole: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

// Hook to use the authentication context
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
  // 1. State for authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 2. State for the user's role ('hr' or 'user')
  const [userRole, setUserRole] = useState(null);
  // 3. State to handle initial loading (checking local storage)
  const [loading, setLoading] = useState(true);

  // --- Initial Check (Runs once on app load) ---
  useEffect(() => {
    // Check if a role is stored in local storage (e.g., simulating JWT/session check)
    const storedRole = localStorage.getItem('userRole');

    if (storedRole) {
      setUserRole(storedRole);
      setIsLoggedIn(true);
    }
    setLoading(false); // Finished initial check
  }, []);

  // --- Login Function (Used by the LoginPage) ---
  const login = (role) => {
    if (role === 'hr' || role === 'user') {
      // 1. Store the role (simulating a successful token/session)
      localStorage.setItem('userRole', role);
      // 2. Update React state
      setUserRole(role);
      setIsLoggedIn(true);
      // Optional: Add an alert for feedback
      console.log(`User logged in with role: ${role}`);
    } else {
      console.error("Invalid role provided to login function.");
    }
  };

  // --- Logout Function (Used by a Logout button) ---
  const logout = () => {
    // 1. Clear the stored role
    localStorage.removeItem('userRole');
    // 2. Clear React state
    setUserRole(null);
    setIsLoggedIn(false);
  };

  // The context value passed to consuming components
  const contextValue = {
    isLoggedIn,
    userRole,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};