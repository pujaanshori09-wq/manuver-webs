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
 * Automatically initializes the users table if it does not exist
 */
export async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(query);
    client.release();
    console.log('PostgreSQL: users table initialized successfully');
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

