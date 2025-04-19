
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_RELEASE: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
