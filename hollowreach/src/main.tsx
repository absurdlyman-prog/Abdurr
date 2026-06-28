import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './ui/styles/global.css';

// Remove the first-paint loader once React owns the screen.
const boot = document.getElementById('boot');
if (boot) boot.remove();

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
