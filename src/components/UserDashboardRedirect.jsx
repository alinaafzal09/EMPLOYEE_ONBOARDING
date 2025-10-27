// src/components/UserDashboardRedirect.jsx 

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboardRedirect = () => {
    const { userRole, isLoggedIn, loading } = useAuth();

    if (loading) {
        // Wait for the auth check to complete
        return <div style={{height: '100vh'}}>Loading...</div>; 
    }

    if (!isLoggedIn) {
        // Should be caught by the PrivateRoute, but a fallback is good
        return <Navigate to="/" replace />;
    }

    if (userRole === 'hr') {
        // HR user goes to the Home (Dashboard) page
        return <Navigate to="/home" replace />;
    }

    if (userRole === 'user') {
        // Standard user goes to the Registration page
        return <Navigate to="/registration" replace />;
    }
    
    // Fallback for any unexpected role
    return <Navigate to="/" replace />;
};

export default UserDashboardRedirect;