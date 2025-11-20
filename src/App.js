import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import { useAuth } from "./context/AuthContext"; 

// Import the new scroll control component
import ScrollLocker from './components/ScrollLocker'; 

// Core Application Pages & Layout Components
import Home from "./pages/Home"; 
import RegisterNewCheck from "./pages/RegisterNewCheck"; 
import LandingPage from './pages/LandingPage'; 
import PrivateRoute from './components/PrivateRoute'; 
import UserDashboardRedirect from './components/UserDashboardRedirect'; 
import CandidatesPage from './pages/CandidatesPage'; 


function App() {
    const { loading } = useAuth(); // Only need loading here

    if (loading) {
        return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'}}>Loading Application...</div>;
    }

    return (
        <div className="app-container">
            <Routes>
                
                {/*  A. PUBLIC ROUTES (Wrapped for NON-SCROLL) */}
                <Route 
                    path="/" 
                    element={<ScrollLocker><LandingPage /></ScrollLocker>} 
                /> 
                <Route 
                    path="/login" 
                    element={<ScrollLocker><LandingPage /></ScrollLocker>} 
                />
                
                {/*  B. PROTECTED ROUTES GROUP */}
                
                {/* NON-SCROLLABLE Dashboard & Home Routes (Wrapped) */}
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<ScrollLocker><UserDashboardRedirect /></ScrollLocker>} />} 
                />

                {/* 1. HR-ONLY Routes (Wrapped for NON-SCROLL) */}
                <Route 
                    path="/home" 
                    element={<PrivateRoute rolesRequired={['hr']} element={<ScrollLocker><Home /></ScrollLocker>} />} 
                />

                {/*  Candidates List (RESTRICTED to HR only) (Wrapped for NON-SCROLL) */}
                <Route 
                    path="/candidates" 
                    element={<PrivateRoute rolesRequired={['hr']} element={<ScrollLocker><CandidatesPage /></ScrollLocker>} />} 
                />
                
                {/* 2. HR and USER Routes (Registration Page) - NOT Wrapped (SCROLLABLE) */}
                <Route 
                    path="/registration" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />} 
                />
                <Route 
                    path="/new-check" 
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />} 
                />

                {/* Fallback for 404 Pages (Wrapped for NON-SCROLL) */}
                <Route path="*" element={<ScrollLocker><Navigate to="/login" replace /></ScrollLocker>} />
                
            </Routes>
        </div>
    );
}

export default App;

