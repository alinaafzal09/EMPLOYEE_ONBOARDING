// src/components/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppConfig } from '../config'; 
import './LoginPage.css'; 

const LoginPage = ({ closeDrawer }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //  State for "Remember Me" checkbox
    const [rememberMe, setRememberMe] = useState(false); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const mockUsers = AppConfig.mockCredentials; 

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const userFound = mockUsers.find(
            u => u.email === email && u.password === password
        );
        
        setTimeout(() => {
            setIsLoading(false);
            
            if (userFound) {
                const userRole = userFound.role;
                
                //   can use 'rememberMe' state here, e.g., to store credentials in localStorage
                if (rememberMe) {
                    console.log("Remember Me is checked. In a real app, you'd save credentials/token.");
                    // Example: localStorage.setItem('rememberedEmail', email);
                } else {
                    console.log("Remember Me is not checked.");
                    // Example: localStorage.removeItem('rememberedEmail');
                }

                login(userRole); 
                closeDrawer(); 

                // Redirect based on the assigned role
                if (userRole === 'hr') {
                    navigate('/home', { replace: true });
                } else if (userRole === 'user') {
                    navigate('/registration', { replace: true });
                }
            } else {
                setError("Invalid email or password. Please check your credentials.");
            }
        }, 1000); // Simulate API call delay
    };

    return (
        <div className="login-form-container">
            {/* Logo and Form UI */}
            <div style={{marginBottom: '2rem'}}>
                <img 
                    src={AppConfig.logoPath} 
                    alt={AppConfig.logoAltText} 
                    style={{ width: '100px', height: 'auto' }} 
                />
            </div>

            <h2 style={{color: 'white'}}>Log In</h2>

            <form onSubmit={handleLogin}>
                {error && <p style={{color: '#FF6347', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</p>}

                <div className="form-input-wrapper">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="login-form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-input-wrapper">
                    <input 
                        type="password"
                        placeholder="Password" 
                        className="login-form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                
                {/*  "Remember Me" Checkbox */}
                <div className="checkbox-group">
                    <input 
                        type="checkbox" 
                        id="rememberMe" 
                        className="custom-checkbox-input"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="rememberMe" className="custom-checkbox-label">
                        Remember me
                    </label>
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;