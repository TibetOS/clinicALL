import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Note: StrictMode removed to prevent Supabase auth double-initialization issues
// StrictMode causes components to mount twice, which conflicts with Supabase's
// browser tab lock mechanism, causing AbortError and auth failures
root.render(<App />);
