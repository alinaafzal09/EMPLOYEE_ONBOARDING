// src/components/Sidebar.jsx

import React, { useState } from "react";
//  useNavigate for redirection
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import './Sidebar.css'; 

// Import all necessary icons, including the one for Logout
import { 
    HomeIcon, 
    PencilSquareIcon, 
    UsersIcon, 
    ChartBarIcon, 
    Cog6ToothIcon, 
    QuestionMarkCircleIcon, 
    ChevronRightIcon, 
    Bars3Icon, 
    XMarkIcon, 
    ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

// Define the menu items, including the Candidates link
const menuItems = [
    { name: "Dashboard", icon: HomeIcon, path: "/dashboard", current: false }, 
    { name: "Request New Check", icon: PencilSquareIcon, path: "/registration", current: false }, 
    // This is the link for your CandidatesPage
    { name: "Candidates", icon: UsersIcon, path: "/candidates", current: true }, 
    { name: "Analytics", icon: ChartBarIcon, path: "/analytics", current: false },
    { name: "Settings", icon: Cog6ToothIcon, path: "/settings", current: false },
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help", current: false },
];

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); 
    const location = useLocation();
    // INITIALIZE HOOKS: Get the navigation function
    const navigate = useNavigate(); 

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
    
    // LOGOUT LOGIC: Clear session and redirect
    const handleLogout = () => {
        // 1. Clear the authentication token/user data
        //    (e.g., if you store the token in localStorage)
        localStorage.removeItem('authToken'); 
        
        // 2. Redirect the user to the landing page ("/")
        navigate('/'); 
    };

    const ToggleIcon = isCollapsed ? Bars3Icon : XMarkIcon;

    return (
        <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''}`}> 
            
            <div className="top-section">
                
                <div className="sidebar-collapse-bar">
                    
                    <h2 className="sidebar-header">
                        {!isCollapsed && "Trident info System"}
                    </h2>
                    
                    <button 
                        onClick={toggleSidebar} 
                        className="collapse-button"
                        aria-expanded={!isCollapsed}
                        aria-controls="nav-menu-list"
                    >
                        <ToggleIcon className="icon-small" /> 
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="nav-menu" id="nav-menu-list">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        
                        // Check if the current route matches the item's path, or if it's the registration path alias
                        const isActive = location.pathname === item.path || 
                                         (item.path === '/registration' && location.pathname === '/new-check'); 
                        
                        return (
                            <Link
                                key={item.name}
                                to={item.path} 
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon className="icon-small" /> 
                                {!isCollapsed && item.name}
                                {isActive && !isCollapsed && <ChevronRightIcon className="arrow-icon" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile */}
            <div className={`user-profile ${isCollapsed ? 'hidden' : ''}`}>
                <div className="user-info">
                    <div className="user-avatar">PK</div>
                    <div>
                        <p className="user-name">HRdesk</p>
                        <p className="user-title">Hiring Manager</p>
                    </div>
                </div>
            </div>
            
            {/* LOGOUT BUTTON */}
            {!isCollapsed && (
                <div className="sidebar-logout-container">
                    <button 
                        className="logout-button" 
                        onClick={handleLogout} // Calls the function to clear session and redirect
                    >
                        <ArrowRightOnRectangleIcon className="logout-icon" />
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            )}
            
        </div>
    );
};

export default Sidebar;