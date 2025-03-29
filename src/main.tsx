
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import { Replay } from "@sentry/replay";
import App from './App.tsx'
import './index.css'

// Initialize Sentry
// Replace SENTRY_DSN with your actual Sentry DSN
Sentry.init({
  dsn: "YOUR_SENTRY_DSN", 
  integrations: [
    new Replay(),
  ],
  // Performance monitoring configuration
  tracesSampleRate: 0.1,
  // Session replay configuration
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
    <App />
  </Sentry.ErrorBoundary>
);
