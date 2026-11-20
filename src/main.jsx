import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import boutique stylesheets
import '../styles/main.css';
import '../styles/animations.css';
import '../styles/fitting-room.css';
import '../styles/auth.css';
import '../styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
