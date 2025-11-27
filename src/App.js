import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ScrollLocker from './components/ScrollLocker';

import Home from "./pages/Home";
import RegisterNewCheck from "./pages/RegisterNewCheck";
import LandingPage from './pages/LandingPage';
import LoginPage from './components/LoginPage';  
import PrivateRoute from './components/PrivateRoute';
import UserDashboardRedirect from './components/UserDashboardRedirect';
import CandidatesPage from './pages/CandidatesPage';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white'
            }}>
                Loading Application...
            </div>
        );
    }

    return (
        <div className="app-container">
            <Routes>

                {/* Landing Page */}
                <Route
                    path="/"
                    element={<ScrollLocker><LandingPage /></ScrollLocker>}
                />

                {/* Login Page */}
                <Route
                    path="/login"
                    element={<ScrollLocker><LoginPage /></ScrollLocker>}
                />

                {/* Dashboard Redirect */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute
                            rolesRequired={['hr', 'user']}
                            element={<UserDashboardRedirect />}
                        />
                    }
                />

                {/* HR HOME */}
                <Route
                    path="/home"
                    element={
                        <PrivateRoute
                            rolesRequired={['hr']}
                            element={<Home />}
                        />
                    }
                />

                {/* Candidates */}
                <Route
                    path="/candidates"
                    element={
                        <PrivateRoute
                            rolesRequired={['hr']}
                            element={<CandidatesPage />}
                        />
                    }
                />

                {/* Registration */}
                <Route
                    path="/registration"
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />}
                />

                <Route
                    path="/new-check"
                    element={<PrivateRoute rolesRequired={['hr', 'user']} element={<RegisterNewCheck />} />}
                />

                {/* 404 → Go to LandingPage (NOT login) */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </div>
    );
}

export default App;
