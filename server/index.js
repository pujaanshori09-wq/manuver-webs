import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import {
  authRouter,
  handleGetMe,
  requireAuth,
  handleGetDashboardData,
  handleGetProjects,
  handleGetRequests,
  handleCreateRequest
} from './auth.js';
import chatHandler from '../api/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Explicit CORS origin allowlist (strict credentials support)
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:3000'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow any local development origin (localhost or 127.0.0.1 on any port)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || (origin.endsWith('.vercel.app') && origin.includes('manuver'))) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize PostgreSQL database schema
initDb();

// Strict endpoint GET /api/me
app.get('/api/me', handleGetMe);

// Dedicated API endpoints for dashboard data & request submission
app.get('/api/dashboard/data', requireAuth, handleGetDashboardData);
app.get('/api/projects', requireAuth, handleGetProjects);
app.get('/api/requests', requireAuth, handleGetRequests);
app.post('/api/requests', requireAuth, handleCreateRequest);

// Mount Google OAuth & Auth routes on both /api/auth and /auth
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// Chatbot API endpoint
app.all('/api/chat', (req, res) => {
  return chatHandler(req, res);
});

// Serve frontend static files if dist exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Dedicated route for /dashboard
app.get('/dashboard', (req, res) => {
  const distDashboard = path.join(distPath, 'dashboard.html');
  const rootDashboard = path.join(__dirname, '../dashboard.html');
  if (fs.existsSync(distDashboard)) {
    return res.sendFile(distDashboard);
  }
  return res.sendFile(rootDashboard);
});

// Serve standalone prototype pages directly if requested
app.get('/prototype-particles.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../prototype-particles.html'));
});
app.use('/src', express.static(path.join(__dirname, '../src')));

// Fallback to index.html for SPA routing
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Manuver Express API Server is running. Use frontend on port 5173 or build dist.');
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Express Uncaught Error]:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Manuver Express Server running on: http://localhost:${PORT}`);
  console.log(`🔐 Google OAuth Endpoint: http://localhost:${PORT}/api/auth/google`);
  console.log(`===============================================`);
});

