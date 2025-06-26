// API Configuration for 4site.pro
window.API_CONFIG = {
  // For now, use the development server
  // In production, this would point to your Vercel/Netlify functions
  API_BASE_URL: 'https://4site-api.vercel.app',
  
  // Fallback to demo mode if API is not available
  DEMO_MODE: true,
  
  // Default templates for demo mode
  PREMIUM_TEMPLATES: [
    'liquid-metal-commerce',
    'motion-design-system', 
    'glassmorphism-dashboard',
    'cyberpunk-terminal'
  ]
};