import express from 'express';
import jwt from 'jsonwebtoken';
import {
  upsertGoogleUser,
  findUserById,
  getUserDashboardData,
  createProjectBrief,
  saveRoiCalculation
} from './db.js';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'manuver_super_secure_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

function getRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host');
  // Default to /auth/google/callback as configured in Google Console
  return `${protocol}://${host}/auth/google/callback`;
}

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const isCrossSite = process.env.COOKIE_SAMESITE === 'none' || Boolean(process.env.CROSS_SITE);
  return {
    httpOnly: true,
    secure: isProd || isCrossSite,
    sameSite: isCrossSite ? 'none' : 'lax',
    path: '/'
  };
}

/**
 * Shared handler for GET /api/me and GET /api/auth/me
 * Returns { id, email, name, avatarUrl } for the user in the verified JWT cookie
 */
export async function handleGetMe(req, res) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const token = req.cookies?.manuver_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;
    try {
      user = await findUserById(decoded.userId);
    } catch (_) {}

    const id = user?.id || decoded.userId;
    const email = user?.email || decoded.email;
    const name = user?.name || decoded.name;
    const avatarUrl = user?.avatar_url || decoded.avatarUrl || '';

    return res.json({ id, email, name, avatarUrl });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * 1. GET /api/auth/google
 * Redirects the user to Google's standard OAuth consent screen
 */
authRouter.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).send(`
      <h3>Google Client ID belum dikonfigurasi di file .env!</h3>
      <p>Silakan tambahkan <code>GOOGLE_CLIENT_ID=...</code> di file .env Anda.</p>
    `);
  }

  const redirectUri = getRedirectUri(req);
  const scope = encodeURIComponent('openid email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  res.redirect(googleAuthUrl);
});

/**
 * 2. GET /api/auth/google/callback
 * Handles the redirect back from Google, exchanges code for user profile,
 * saves to PostgreSQL, sets JWT cookie, and redirects to frontend
 */
authRouter.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Google OAuth error:', error);
    return res.redirect('/?auth=error&reason=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    const redirectUri = getRedirectUri(req);

    // Exchange auth code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Failed to exchange token:', tokenData);
      return res.redirect('/?auth=failed_token_exchange');
    }

    // Fetch user profile from Google userinfo API
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const profile = await userinfoResponse.json();

    if (!profile.id || !profile.email) {
      return res.redirect('/?auth=failed_profile_fetch');
    }

    // Upsert user into PostgreSQL database (with resilient fallback if DB is not connected yet)
    let dbUser = null;
    try {
      dbUser = await upsertGoogleUser({
        googleId: profile.id,
        email: profile.email,
        name: profile.name || profile.given_name || 'User',
        avatarUrl: profile.picture || ''
      });
    } catch (dbErr) {
      console.warn('PostgreSQL write skipped (database not connected):', dbErr.message);
      dbUser = {
        id: profile.id,
        google_id: profile.id,
        email: profile.email,
        name: profile.name || profile.given_name || 'User',
        avatar_url: profile.picture || ''
      };
    }

    // Generate JWT token (valid for 7 days)
    const token = jwt.sign(
      {
        userId: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatar_url
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie using unified options
    const cookieOptions = {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    res.cookie('manuver_token', token, cookieOptions);

    // Redirect user to the protected dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error('OAuth callback exception:', err);
    res.redirect('/?auth=server_error');
  }
});

/**
 * 3. GET /api/auth/me (also wired directly to /api/me)
 * Returns { id, email, name, avatarUrl } for the user in the verified JWT cookie
 */
authRouter.get('/me', handleGetMe);

/**
 * 4. POST /api/auth/logout
 * Clears the session cookie using exact matching attributes
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('manuver_token', getCookieOptions());
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * 5. GET /api/auth/dashboard
 * Retrieves comprehensive client portal dashboard data from PostgreSQL
 */
authRouter.get('/dashboard', async (req, res) => {
  const token = req.cookies?.manuver_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const data = await getUserDashboardData(decoded.userId);
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

/**
 * 6. POST /api/auth/brief
 * Submits a new project brief to PostgreSQL
 */
authRouter.post('/brief', async (req, res) => {
  const token = req.cookies?.manuver_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { serviceCategory, description, budgetRange, targetTimeline } = req.body;
    if (!serviceCategory || !description) {
      return res.status(400).json({ error: 'Service category and description are required' });
    }
    const brief = await createProjectBrief({
      userId: decoded.userId,
      serviceCategory,
      description,
      budgetRange,
      targetTimeline
    });
    res.json({ success: true, brief });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. POST /api/auth/roi
 * Saves ROI calculator estimates to PostgreSQL
 */
authRouter.post('/roi', async (req, res) => {
  const token = req.cookies?.manuver_token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { hoursPerWeek, teamSize, monthlySavedHours, annualSavedHours } = req.body;
    const result = await saveRoiCalculation({
      userId: decoded.userId,
      hoursPerWeek,
      teamSize,
      monthlySavedHours,
      annualSavedHours
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

