import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="font-family:sans-serif;padding:2rem;text-align:center;color:#333">
        <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
        <div style="font-weight:bold;margin-bottom:.5rem">Erreur de chargement</div>
        <div style="font-size:.9rem;color:#666;margin-bottom:1rem">${e.message}</div>
        <button onclick="location.reload()" style="padding:.5rem 1.5rem;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer">
          Réessayer
        </button>
      </div>`;
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);