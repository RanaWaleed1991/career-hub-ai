// Import polyfills first, before any other code
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: "https://5dc6acc0433b381bbd5e9c14192365d1@o4510462839029760.ingest.us.sentry.io/4510467808821248",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions (reduce in production if needed)
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions when an error occurs
  // Environment
  environment: import.meta.env.MODE, // 'development' or 'production'
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
