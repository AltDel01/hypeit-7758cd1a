import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files from dist directory (production build)
app.use(express.static(join(__dirname, 'dist')));

// Proxy middleware for ModelArk API
const modelArkProxy = createProxyMiddleware({
  target: 'https://ark.ap-southeast.bytepluses.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api/v3',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ModelArk API`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
});

// Apply proxy middleware to /api routes
app.use('/api', modelArkProxy);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexContent = readFileSync(indexPath, 'utf-8');
    res.send(indexContent);
  } catch (error) {
    res.status(404).send('Build not found. Please run npm run build first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying /api -> https://ark.ap-southeast.bytepluses.com/api/v3`);
  console.log(`Serving static files from dist directory`);
});