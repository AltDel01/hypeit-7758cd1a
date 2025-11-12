import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins (you can restrict this in production)
app.use(cors({
  origin: true,
  credentials: true
}));

// Proxy middleware for ModelArk API
const modelArkProxy = createProxyMiddleware({
  target: 'https://ark.ap-southeast.bytepluses.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api/v3', // Rewrite /api to /api/v3
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Proxying /api -> https://ark.ap-southeast.bytepluses.com/api/v3`);
});