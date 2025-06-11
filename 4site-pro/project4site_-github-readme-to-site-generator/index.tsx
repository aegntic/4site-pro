
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import App from './App-test';
// import App from './App-minimal';

console.log('Index.tsx loading...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('Root element found:', rootElement);

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <>
        <div className="gradient-mesh" />
        <App />
      </>
    </React.StrictMode>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  // Fallback to show error on page
  rootElement.innerHTML = `
    <div style="padding: 20px; background: #161b22; color: #ef4444; font-family: monospace;">
      <h1>Error Loading App</h1>
      <pre>${error}</pre>
    </div>
  `;
}
