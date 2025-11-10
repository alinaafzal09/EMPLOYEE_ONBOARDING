// src/config.js

export const AppConfig = {
    // Branding & Content for Landing Page
    companyName: "Trident Information System",
    companyEmail: "info@tridentinfo.com",
    tagline: "Welcome to Trident Information System!",
    
    // Logo 
    logoPath:'../assets/trident-logo-copy-1.webp',
    logoAltText: 'Trident Logo',
    logoWidth: '150px',
    logoHeight: 'auto',
    
    // Test Credentials (Mock Backend)
    mockCredentials: [
        { email: 'hr@trident.com', password: '1234', role: 'hr' },
        { email: 'user@trident.com', password: '1234', role: 'user' },
    ],
};