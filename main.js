import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const hasValidSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_') &&
  !supabaseUrl.includes('PASTE_') &&
  !supabaseAnonKey.includes('YOUR_') &&
  !supabaseAnonKey.includes('PASTE_') &&
  !supabaseAnonKey.startsWith('sb_secret_')
);

if (!hasValidSupabaseConfig) {
  console.warn('Supabase env is not configured correctly. Use the project URL and the publishable key, not the secret key.');
}

const supabase = hasValidSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function signInWithGoogle() {
  if (!supabase) {
    alert('Supabase is not configured correctly. Put your project URL and publishable key in .env.');
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google login error:', error.message);
    alert(error.message);
  }
}

const button = document.getElementById('google-login');
if (button) {
  button.addEventListener('click', signInWithGoogle);
}

const signInLink = document.getElementById('sign-in-link');
if (signInLink) {
  signInLink.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

if (supabase) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Session check failed:', error.message);
      return;
    }

    if (data.session) {
      console.log('User session exists:', data.session.user.email);
    } else {
      console.log('No active session yet.');
    }
  });
}
