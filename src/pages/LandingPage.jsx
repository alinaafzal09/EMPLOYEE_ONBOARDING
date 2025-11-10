// src/pages/LandingPage.jsx

import React, { useState } from 'react';
import LoginPage from '../components/LoginPage'; 
import { AppConfig } from '../config'; 
import './LandingPage.css';



const LandingPage = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    
    const info = AppConfig; 
 

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        
        <div className="landing-container relative overflow-hidden text-white">
            
            
            <div className="absolute inset-0 -z-10">
                
              
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
                <div className="stars4"></div>
                <div className="stars5"></div>
                <div className="stars6"></div>
                <div className="stars7"></div>




                {/* Waves SVGs  */}
                <svg
                    className="absolute bottom-0 left-0 w-[50vw] opacity-70"
                    viewBox="0 0 600 200"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,100 C150,200 350,0 600,100 L600,200 L0,200 Z"
                        fill="url(#grad1)"
                    />
                    <defs>
                        <linearGradient id="grad1" x1="0" x2="1" y1="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#00BFAA" />
                        </linearGradient>
                    </defs>
                </svg>

                <svg
                    className="absolute right-0 top-1/3 w-[40vw] opacity-60 rotate-180"
                    viewBox="0 0 600 200"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,100 C150,200 350,0 600,100 L600,200 L0,200 Z"
                        fill="url(#grad2)"
                    />
                    <defs>
                        <linearGradient id="grad2" x1="1" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#00BFAA" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            

            {/* Info Section */}
            <div className="info-panel relative z-10">
                <div className="mb-12">
                    <img 
                        src={info.logoPath} 
                        alt={info.logoAltText} 
                        style={{ width: info.logoWidth, height: info.logoHeight }}
                    />
                </div>

                <h1>{info.tagline}</h1>
                <p className="text-white text-lg mb-2">{info.companyName}</p>
                <p className="text-gray-400 mb-8">Email: {info.companyEmail}</p>
                <p className="text-gray-500 italic">
                    [Content placeholder: Add a system summary here later...]
                </p>
            </div>


            <button 
                className="login-toggle-btn"
                onClick={toggleDrawer}
            >
                {isDrawerOpen ? 'Close' : 'Log In'}
            </button>

            <div className={`login-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <LoginPage closeDrawer={closeDrawer} />
            </div>

            <div 
                className={`drawer-overlay ${isDrawerOpen ? 'visible' : ''}`}
                onClick={closeDrawer} 
            />
        </div>
    );
};

export default LandingPage;