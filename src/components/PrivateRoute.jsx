import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar'; 

// Accepts the component to render as an 'element' prop from App.js
const PrivateRoute = ({ rolesRequired, element: Element }) => {
    const { isLoggedIn, userRole, loading } = useAuth();
    const location = useLocation(); 

    /* --- 1. Sidebar Visibility Logic (Role-Aware) --- */
    
    // Paths where the sidebar is hidden for NON-HR users
    const pathSegmentsToHideSidebar = ['/registration', '/new-check']; 
    
    // Check if the current path is in the exclusion list
    const isExcludedPath = pathSegmentsToHideSidebar.some(segment => 
        location.pathname.startsWith(segment)
    );
    
    // Sidebar should show UNLESS the path is excluded AND the user is NOT 'hr'
    const shouldShowSidebar = (
        userRole === 'hr' || // HR always sees the sidebar
        !isExcludedPath     // Everyone else sees it on non-excluded paths
    );

    /* --- 2. Authentication and Role Checks --- */
    
    if (loading) {
        return <div style={{padding: '50px', color: 'white'}}>Loading user session...</div>; 
    }

    if (!isLoggedIn) {
        // Not logged in, redirect to the login page (no layout wrapper needed here)
        return <Navigate to="/login" replace />;
    }
    
    // Determine the content to render (either the requested page or a redirect)
    let ContentToRender = Element;
    
    if (rolesRequired && rolesRequired.length > 0) {
        if (!rolesRequired.includes(userRole)) {
            
            // Role is insufficient for the requested route. Redirect internally.
            alert("Unauthorized access. Redirecting you to your primary authorized page.");
            
            if (userRole === 'user') {
                // Redirect 'user' to their main page
                ContentToRender = <Navigate to="/registration" replace />; 
            } else {
                // Redirect all others (e.g., unauthorized admin types) to /home
                ContentToRender = <Navigate to="/home" replace />; 
            }
        }
    }

    // Safety check for the element prop
    if (!ContentToRender) {
         ContentToRender = <Navigate to="/login" replace />; 
    }

    /* --- 3. Final Layout Render --- */
    return (
        // Renders the main application layout
        <div className="home-container" style={{display: 'flex'}}>
            
            {/* Conditional Sidebar */}
            {shouldShowSidebar && <Sidebar />} 
            
            {/* The main content area */}
            <div className="main-content" style={{flex: 1}}>
                {/* Renders the requested component OR the internal <Navigate /> */}
                {ContentToRender} 
            </div>
        </div>
    );
};

export default PrivateRoute;