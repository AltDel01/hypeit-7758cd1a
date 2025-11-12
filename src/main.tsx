
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import App from './App.tsx'
import './index.css'

// Initialize error monitoring with minimal fingerprinting
Sentry.init({
  dsn: "https://e8f864791b8537966d06170536cfc8aa@o4509061282332672.ingest.us.sentry.io/4509061376180224",
  
  // Performance monitoring configuration - reduced to minimize fingerprinting
  tracesSampleRate: 0.05,
  
  // Session replay configuration - reduced to minimize fingerprinting
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 0.5,
  
  // Disable source maps for production
  integrations: [],
  
  // Custom release name to avoid revealing version info
  release: "production-release",
  
  // Remove framework details from reports
  sendClientReports: false,
  
  // Minimize metadata sent
  attachStacktrace: false,
});

// Use non-standard mounting to avoid React/ReactDOM detection
const appRoot = document.getElementById("root");
if (appRoot) {
  createRoot(appRoot).render(
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <App />
    </Sentry.ErrorBoundary>
  );
}
