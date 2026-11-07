import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import App from './App';
import { ScrollPrologueController } from './prologue/ScrollPrologueController.js';

document.addEventListener('DOMContentLoaded', () => {
  // Always land on the Prologue at the top when entering the website
  if (window.location.hash && window.location.hash !== '#prologue') {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  // 1. Initialize the 3D Scroll Prologue Controller
  const prologueController = new ScrollPrologueController();
  window.__prologueController = prologueController;

  // 2. Mount the Unified Connected Journey React Application (Chapters + 3D Mission Lab + Finale)
  const appRootEl = document.getElementById('appRoot');
  if (appRootEl) {
    const root = createRoot(appRootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});
