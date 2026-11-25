import React, { StrictMode } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import FeedPage from './pages/FeedPage.jsx';
import './style.css';

function ReactApp() {
  return <StrictMode><FeedPage /></StrictMode>;
}

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: ReactApp,
  errorBoundary() {
    return <p role="alert">Лента React недоступна. Перезагрузите страницу или выберите Vue в меню.</p>;
  },
});
