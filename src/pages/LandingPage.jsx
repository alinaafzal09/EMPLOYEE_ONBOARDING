// src/pages/LandingPage.jsx

import React, { useState } from 'react';
import LoginPage from '../components/LoginPage'; 
import { AppConfig } from '../config'; 

const LandingPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };
    
    // Closes the drawer when clicking the overlay or after successful login
    const closeDrawer = () => {
        setIsDrawerOpen(false);
    }

    const info = AppConfig; 

    return (
        <div className="landing-container">
            
            {/* 1. Left Information Panel (Fixed) */}
            <div className="info-panel">
                
                {/* Automated Logo */}
                <div style={{marginBottom: '3rem'}}>
                    <img 
                        src={info.logoPath} 
                        alt={info.logoAltText} 
                        style={{ width: info.logoWidth, height: info.logoHeight }} 
                    />
                </div>

                {/* Automated Content */}
                <h1>{info.tagline}</h1>
                <p style={{fontSize: '1.2rem', color: 'white', marginBottom: '0.5rem'}}>
                    {info.companyName}
                </p>
                <p style={{fontSize: '1rem', color: '#9ca3af', marginBottom: '2rem'}}>
                    Email: {info.companyEmail}
                </p>

                {/* Professional Summary Placeholder (ready for content) */}
                <p style={{marginTop: '2rem', color: '#6b7280', fontStyle: 'italic'}}>
                    [Content placeholder: Add a system summary here later. This area provides a welcoming, high-impact first impression.]
                </p>
            </div>

            {/* 2. Login Toggle Button (Top Right Edge) */}
            <button 
                className="login-toggle-btn" 
                onClick={toggleDrawer}
            >
                {/* ⭐ UPDATED TEXT: Show 'Close' only when open, otherwise show 'Log In' */}
                {isDrawerOpen ? 'Close' : 'Log In'}
            </button>

            {/* 3. Login Drawer (The Sliding Panel) */}
            <div className={`login-drawer ${isDrawerOpen ? 'open' : ''}`}>
                {/* We pass the closeDrawer function down to LoginPage for internal form submission closing */}
                <LoginPage closeDrawer={closeDrawer} />
            </div>

            {/* 4. Overlay (Click-to-Close) */}
            <div 
                className={`drawer-overlay ${isDrawerOpen ? 'visible' : ''}`}
                onClick={closeDrawer} 
            >
                {/* Empty, captures clicks on the background to close the drawer */}
            </div>
        </div>
    );
};

export default LandingPage;