import express from 'express';
import jwt from 'jsonwebtoken';
import { upsertGoogleUser, findUserById } from './db.js';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'manuver_super_secure_jwt_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';

function getRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host');
  // Use current incoming path prefix (/auth or /api/auth)
  const basePath = req.baseUrl || '/api/auth';
  return `${protocol}://${host}${basePath}/google/callback`;
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

    // Upsert user into PostgreSQL database
    const dbUser = await upsertGoogleUser({
      googleId: profile.id,
      email: profile.email,
      name: profile.name || profile.given_name || 'User',
      avatarUrl: profile.picture || ''
    });

    // Generate JWT token (valid for 7 days)
    const token = jwt.sign(
      { userId: dbUser.id, email: dbUser.email, name: dbUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('manuver_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect user back to the homepage
    res.redirect('/?auth=success');
  } catch (err) {
    console.error('OAuth callback exception:', err);
    res.redirect('/?auth=server_error');
  }
});

/**
 * 3. GET /api/auth/me
 * Returns current authenticated user from PostgreSQL
 */
authRouter.get('/me', async (req, res) => {
  const token = req.cookies?.manuver_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ user: null });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ user: null });
  }
});

/**
 * 4. POST /api/auth/logout
 * Clears the session cookie
 */
authRouter.post('/logout', (req, res) => {
  res.clearCookie('manuver_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

