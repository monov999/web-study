import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FeedPage from './pages/FeedPage.jsx';
import './style.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><FeedPage /></StrictMode>,
);
