// src/config.js

export const AppConfig = {
    // Branding & Content for Landing Page
    companyName: "Trident Information System",
    companyEmail: "info@tridentinfo.com",
    tagline: "Welcome to Trident Information System!",
    
    // Logo (Update path if needed)
    logoPath: '/trident-logo.png', 
    logoAltText: 'Trident Logo',
    logoWidth: '150px',
    logoHeight: 'auto',
    
    // Test Credentials (Mock Backend)
    mockCredentials: [
        // Password changed to 1234
        { email: 'hr@trident.com', password: '1234', role: 'hr' },
        // Password changed to 1234
        { email: 'user@trident.com', password: '1234', role: 'user' },
    ],
};