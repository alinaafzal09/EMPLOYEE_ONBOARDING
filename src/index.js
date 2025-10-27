// src/index.js -

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Your global styles
import reportWebVitals from './reportWebVitals';

// 1. IMPORT REACT ROUTER DOM
// BrowserRouter is imported and aliased as Router for consistency
import { BrowserRouter as Router } from 'react-router-dom'; 

// 2. IMPORT YOUR AUTH PROVIDER
import { AuthProvider } from './context/AuthContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 🚀 STEP 1: Router MUST wrap the entire application 
        This provides context for <Routes>, <Route>, and useNavigate. */}
    <Router>
      {/* 🔑 STEP 2: AuthProvider MUST wrap App 
            This provides the 'loading', 'isLoggedIn', and 'userRole' state via useAuth. */}
      <AuthProvider>
        <App /> 
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();