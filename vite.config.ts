
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Dynamically import the Sentry plugin to avoid errors when it's not available
let sentryVitePlugin: any;
try {
  // Try to import the Sentry plugin, but don't fail if it's not available
  sentryVitePlugin = require("@sentry/vite-plugin").sentryVitePlugin;
} catch (error) {
  console.warn("Plugin couldn't be loaded. Features will be disabled.");
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
    // Temporarily disable the componentTagger to fix the build issue
    // mode === 'development' && componentTagger(),
  ].filter(Boolean);

  // Only add the Sentry plugin if it was successfully imported and we have an auth token
  if (sentryVitePlugin && process.env.SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        org: "lovable",
        project: "branding-bounce",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      })
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: false, // Disable source maps for production builds
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs
        },
        format: {
          comments: false, // Remove comments
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'react-router-dom',
        'lucide-react',
        'sonner'
      ],
    },
  };
});
