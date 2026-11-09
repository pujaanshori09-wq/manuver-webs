import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { authRouter } from './auth.js';
import chatHandler from '../api/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize PostgreSQL database schema
initDb();

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

// Serve standalone prototype pages directly if requested
app.get('/prototype-particles.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../prototype-particles.html'));
});
app.use('/src', express.static(path.join(__dirname, '../src')));

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Manuver Express API Server is running. Use frontend on port 5173 or build dist.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Manuver Express Server running on: http://localhost:${PORT}`);
  console.log(`🔐 Google OAuth Endpoint: http://localhost:${PORT}/api/auth/google`);
  console.log(`===============================================`);
});

