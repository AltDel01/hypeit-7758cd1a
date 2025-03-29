
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'

// Initialize Sentry with the provided DSN
Sentry.init({
  dsn: "https://e8f864791b8537966d06170536cfc8aa@o4509061282332672.ingest.us.sentry.io/4509061376180224",
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
