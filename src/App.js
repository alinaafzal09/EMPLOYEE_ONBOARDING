// src/App.js - 

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import { useAuth } from "./context/AuthContext"; 

// Core Application Pages & Layout Components
import Home from "./pages/Home"; 
import RegisterNewCheck from "./pages/RegisterNewCheck"; 
import LandingPage from './pages/LandingPage'; 
import PrivateRoute from './components/PrivateRoute'; 
import UserDashboardRedirect from './components/UserDashboardRedirect'; 

function App() {
    const { loading } = useAuth(); // Only need loading here

    if (loading) {
        return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'}}>Loading Application...</div>;
    }

    return (
        <div className="app-container">
            <Routes>
                
                {/* 🟢 A. PUBLIC ROUTES */}
                <Route path="/" element={<LandingPage />} /> 
                <Route path="/login" element={<LandingPage />} />
                
                {/* 🔑 B. PROTECTED ROUTES GROUP */}
                {/* ⚠️ NO Layout wrapper <Route element={...} /> here. PrivateRoute handles it! */}

                {/* ⭐ NEW: Dashboard Entry Point (Redirects based on role) */}
                {/* PrivateRoute element renders the entire layout on success */}
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<UserDashboardRedirect />} />} 
                />

                {/* 1. HR-ONLY Routes (Home Page) */}
                <Route 
                    path="/home" 
                    element={<PrivateRoute rolesRequired={['hr']} element={<Home />} />} 
                />

                {/* 2. HR and USER Routes (Registration Page) */}
                <Route 
                    path="/registration" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />} 
                />
                <Route 
                    path="/new-check" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />} 
                />

                {/* Fallback for 404 Pages */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                
            </Routes>
        </div>
    );
}

export default App;


