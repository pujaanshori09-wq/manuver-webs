import 'dotenv/config';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Local JSON fallback store for resilient offline capability
const DATA_DIR = path.join(process.cwd(), '.data');
const BRIEFS_FILE = path.join(DATA_DIR, 'briefs.json');

function readLocalBriefs() {
  try {
    if (fs.existsSync(BRIEFS_FILE)) {
      return JSON.parse(fs.readFileSync(BRIEFS_FILE, 'utf8'));
    }
  } catch (_) {}
  return [];
}

function saveLocalBrief(brief) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = readLocalBriefs();
    current.unshift(brief);
    fs.writeFileSync(BRIEFS_FILE, JSON.stringify(current, null, 2), 'utf8');
  } catch (err) {
    console.warn('Local brief save error:', err.message);
  }
}

// PostgreSQL connection pool
// Supports local postgres or cloud hosted (Neon, Railway, Aiven, Supabase DB, etc.)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/manuver_db';

const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co');

export const pool = new Pool({
  connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false
});

// Resilient pool error listener to prevent process crashes when database is offline
pool.on('error', (err) => {
  console.warn('PostgreSQL Pool idle error (handled):', err.message);
});

/**
 * Automatically initializes database tables if they do not exist
 */
export async function initDb() {
  const query = `
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- 2. Projects Table (Client Portal Tracker)
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      service_type VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'discovery',
      progress_percent INTEGER DEFAULT 25,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Project Briefs (Lead & Consultation Submissions)
    CREATE TABLE IF NOT EXISTS project_briefs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      service_category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      budget_range VARCHAR(50),
      target_timeline VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. ROI Calculator Records
    CREATE TABLE IF NOT EXISTS roi_calculations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      hours_per_week NUMERIC NOT NULL,
      team_size INTEGER NOT NULL,
      monthly_saved_hours NUMERIC NOT NULL,
      annual_saved_hours NUMERIC NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(query);
    client.release();
    console.log('PostgreSQL: All tables initialized successfully');
  } catch (err) {
    console.warn('PostgreSQL init warning (check DATABASE_URL):', err.message);
  }
}

/**
 * Upserts a Google user into PostgreSQL
 */
export async function upsertGoogleUser({ googleId, email, name, avatarUrl }) {
  const query = `
    INSERT INTO users (google_id, email, name, avatar_url, updated_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (google_id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id, google_id, email, name, avatar_url, created_at, updated_at;
  `;
  const values = [googleId, email, name, avatarUrl];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Finds user by database ID
 */
export async function findUserById(id) {
  try {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId > 2147483647) {
      return null;
    }
    const query = `
      SELECT id, google_id, email, name, avatar_url, created_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [numId]);
    return rows[0] || null;
  } catch (err) {
    return null;
  }
}

/**
 * Gets dashboard data for a user (profile, projects, briefs, saved ROI)
 */
export async function getUserDashboardData(userId) {
  let user = null;
  try {
    user = await findUserById(userId);
  } catch (_) {}

  if (!user) {
    user = { id: userId, name: 'Builder' };
  }

  let projects = await getProjectsByUser(userId);
  let briefs = await getRequestsByUser(userId);
  let latestRoi = null;

  try {
    const roiRes = await pool.query(
      `SELECT * FROM roi_calculations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [Number.isInteger(Number(userId)) ? Number(userId) : null]
    );
    latestRoi = roiRes.rows[0] || null;
  } catch (_) {}

  return {
    user,
    projects,
    briefs,
    latestRoi
  };
}

/**
 * Gets real projects for a user
 */
export async function getProjectsByUser(userId) {
  try {
    const safeId = Number.isInteger(Number(userId)) ? Number(userId) : null;
    if (safeId) {
      const res = await pool.query(
        `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
        [safeId]
      );
      return res.rows || [];
    }
  } catch (err) {
    // DB not connected
  }
  return [];
}

/**
 * Gets real briefs/requests for a user (with resilient fallback)
 */
export async function getRequestsByUser(userId) {
  let dbRows = [];
  try {
    const safeId = Number.isInteger(Number(userId)) ? Number(userId) : null;
    if (safeId) {
      const res = await pool.query(
        `SELECT * FROM project_briefs WHERE user_id = $1 ORDER BY created_at DESC`,
        [safeId]
      );
      dbRows = res.rows || [];
    }
  } catch (err) {
    // DB not connected
  }

  const localRows = readLocalBriefs().filter(b => String(b.user_id) === String(userId) || !b.user_id);
  const combined = [...dbRows, ...localRows];
  return combined;
}

/**
 * Submits a new project brief (with resilient fallback)
 */
export async function createProjectBrief({ userId, serviceCategory, description, budgetRange, targetTimeline, status = 'received' }) {
  try {
    const safeUserId = Number.isInteger(Number(userId)) ? Number(userId) : null;
    if (safeUserId) {
      const query = `
        INSERT INTO project_briefs (user_id, service_category, description, budget_range, target_timeline, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [safeUserId, serviceCategory, description, budgetRange, targetTimeline, status];
      const { rows } = await pool.query(query, values);
      if (rows && rows[0]) {
        return rows[0];
      }
    }
  } catch (dbErr) {
    console.warn('PostgreSQL write skipped (storing to local fallback):', dbErr.message);
  }

  // Resilient fallback record
  const fallbackRecord = {
    id: Date.now(),
    user_id: userId,
    service_category: serviceCategory,
    description,
    budget_range: budgetRange || 'flexible',
    target_timeline: targetTimeline || 'standard',
    status: status || 'received',
    created_at: new Date().toISOString()
  };
  saveLocalBrief(fallbackRecord);
  return fallbackRecord;
}

/**
 * Saves ROI calculation for authenticated user
 */
export async function saveRoiCalculation({ userId, hoursPerWeek, teamSize, monthlySavedHours, annualSavedHours }) {
  const query = `
    INSERT INTO roi_calculations (user_id, hours_per_week, team_size, monthly_saved_hours, annual_saved_hours)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [userId, hoursPerWeek, teamSize, monthlySavedHours, annualSavedHours];
  const { rows } = await pool.query(query, values);
  return rows[0];
}
