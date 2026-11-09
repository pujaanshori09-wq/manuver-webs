import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection pool
// Supports local postgres or cloud hosted (Neon, Railway, Aiven, Supabase DB, etc.)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/manuver_db';

const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co');

export const pool = new Pool({
  connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false
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
  const query = `
    SELECT id, google_id, email, name, avatar_url, created_at
    FROM users
    WHERE id = $1;
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

/**
 * Gets dashboard data for a user (profile, projects, briefs, saved ROI)
 */
export async function getUserDashboardData(userId) {
  const user = await findUserById(userId);
  if (!user) return null;

  let projects = [];
  let briefs = [];
  let latestRoi = null;

  try {
    const projectsRes = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`,
      [userId]
    );
    projects = projectsRes.rows;
  } catch (_) {}

  try {
    const briefsRes = await pool.query(
      `SELECT * FROM project_briefs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );
    briefs = briefsRes.rows;
  } catch (_) {}

  try {
    const roiRes = await pool.query(
      `SELECT * FROM roi_calculations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    latestRoi = roiRes.rows[0] || null;
  } catch (_) {}

  // If new user has no projects yet, provide default onboarding project tracker
  if (projects.length === 0) {
    projects = [
      {
        id: 0,
        title: 'Konsultasi & Discovery Awal Manuver',
        service_type: 'workflow_automation',
        status: 'discovery',
        progress_percent: 25,
        notes: 'Sesi pemetaan alur kerja repetitif dan kebutuhan teknologi bersama tim Manuver.'
      }
    ];
  }

  return {
    user,
    projects,
    briefs,
    latestRoi
  };
}

/**
 * Submits a new project brief
 */
export async function createProjectBrief({ userId, serviceCategory, description, budgetRange, targetTimeline }) {
  const query = `
    INSERT INTO project_briefs (user_id, service_category, description, budget_range, target_timeline)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [userId, serviceCategory, description, budgetRange, targetTimeline];
  const { rows } = await pool.query(query, values);
  return rows[0];
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
