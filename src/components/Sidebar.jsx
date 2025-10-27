// src/components/Sidebar.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import './Sidebar.css'; 

// Import all icons
import { 
    HomeIcon, 
    PencilSquareIcon, 
    UsersIcon, 
    ChartBarIcon, 
    Cog6ToothIcon, 
    QuestionMarkCircleIcon, 
    ChevronRightIcon, 
    Bars3Icon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

// Define the menu items with their respective paths
const menuItems = [
    // ⭐ 1: Dashboard now points to the protected role-redirecting path.
    // This will send HR users to /home and standard users to /registration.
    { name: "Dashboard", icon: HomeIcon, path: "/dashboard", current: false }, 
    
    // ⭐ 2: Request New Check path should match the protected route.
    { name: "Request New Check", icon: PencilSquareIcon, path: "/registration", current: false }, 
    
    { name: "Candidates", icon: UsersIcon, path: "/candidates", current: true }, 
    { name: "Analytics", icon: ChartBarIcon, path: "/analytics", current: false },
    { name: "Settings", icon: Cog6ToothIcon, path: "/settings", current: false },
    { name: "Help", icon: QuestionMarkCircleIcon, path: "/help", current: false },
];

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false); 
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };
    const location = useLocation();
    
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
                        
                        // Check for path equivalence (/registration vs /new-check are treated the same)
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

            {/* User Profile: Hidden when collapsed */}
            <div className={`user-profile ${isCollapsed ? 'hidden' : ''}`}>
                <div className="user-info">
                    <div className="user-avatar">PK</div>
                    <div>
                        <p className="user-name">HRdesk</p>
                        <p className="user-title">Hiring Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;