import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env so /api serverless handlers can read AI_API_KEY during local dev
  for (const [key, val] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }

  return {
    server: {
      proxy: {
        '/api/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/api/me': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          particles: path.resolve(__dirname, 'prototype-particles.html')
        }
      }
    },
    plugins: [
      {
        name: 'api-chat-dev-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && (req.url === '/api/chat' || req.url.startsWith('/api/chat?') || req.url.startsWith('/api/chat/'))) {
              try {
                const { default: handler } = await server.ssrLoadModule('/api/chat.js');
                await handler(req, res);
              } catch (err) {
                console.error('[Vite Dev API Error]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Dev API Error' }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  };
});

