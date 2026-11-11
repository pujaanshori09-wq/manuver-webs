import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import http from 'http';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          bypass: (req) => {
            if (req.url.endsWith('.js') || req.url.includes('.js?')) {
              return req.url;
            }
          },
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              if (!res.headersSent) {
                if (req.headers.accept && req.headers.accept.includes('text/html')) {
                  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                  res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Menghubungkan · Manuver</title><meta http-equiv="refresh" content="1"><style>body{background:#07080B;color:#F4F1EA;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.box{text-align:center;max-width:400px;padding:24px}.spinner{width:28px;height:28px;border:2px solid rgba(244,241,234,0.15);border-top-color:#E8603C;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px}@keyframes spin{to{transform:rotate(360deg)}}h2{font-size:18px;margin:0 0 8px;font-weight:500}p{font-size:13px;color:#8C8B87;margin:0}</style></head><body><div class="box"><div class="spinner"></div><h2>Menghubungkan ke Google...</h2><p>Server sedang aktif. Halaman otomatis berpindah...</p></div></body></html>`);
                  return;
                }
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server initializing, please retry' }));
              }
            });
          }
        },
        '/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              if (!res.headersSent) {
                if (req.headers.accept && req.headers.accept.includes('text/html')) {
                  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                  res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Menghubungkan · Manuver</title><meta http-equiv="refresh" content="1"><style>body{background:#07080B;color:#F4F1EA;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}.box{text-align:center;max-width:400px;padding:24px}.spinner{width:28px;height:28px;border:2px solid rgba(244,241,234,0.15);border-top-color:#E8603C;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px}@keyframes spin{to{transform:rotate(360deg)}}h2{font-size:18px;margin:0 0 8px;font-weight:500}p{font-size:13px;color:#8C8B87;margin:0}</style></head><body><div class="box"><div class="spinner"></div><h2>Menghubungkan ke Google...</h2><p>Server sedang aktif. Halaman otomatis berpindah...</p></div></body></html>`);
                  return;
                }
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Server initializing, please retry' }));
              }
            });
          }
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
        name: 'auto-backend-server',
        configureServer(server) {
          let backendChild = null;

          function startBackend() {
            const checkReq = http.get('http://127.0.0.1:5000/api/me', () => {
              // Port 5000 is already active
            });
            checkReq.on('error', () => {
              console.log('⚡ [Vite Dev] Auto-starting Express server on port 5000...');
              backendChild = fork(path.resolve(__dirname, 'server/index.js'), [], {
                stdio: 'inherit'
              });
            });
          }

          startBackend();

          const stopBackend = () => {
            if (backendChild) {
              try { backendChild.kill(); } catch (_) {}
              backendChild = null;
            }
          };

          server.httpServer?.on('close', stopBackend);
          process.on('SIGINT', stopBackend);
          process.on('SIGTERM', stopBackend);
          process.on('exit', stopBackend);
        }
      },
      {
        name: 'dashboard-dev-rewrite',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url.startsWith('/dashboard') && !req.url.startsWith('/dashboard.html')) {
              req.url = req.url.replace(/^\/dashboard\/?(\?.*)?$/, '/dashboard.html$1');
            }
            next();
          });
        }
      },
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

