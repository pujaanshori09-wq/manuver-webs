import { createClient } from '@supabase/supabase-js';
import { initI18n, t } from './src/i18n.js';
import { initChatWidget } from './src/ChatWidget.js';
import { initLandingSections } from './src/LandingSections.js';

// Initialize i18n & language switcher
initI18n();

// Initialize High-Converting Interactive Landing Sections
initLandingSections('#landing-sections');

// Initialize Manuver AI Assistant Chat Widget
initChatWidget();

// Connect Hero CTA button to open consultative AI discovery
document.querySelector('#hero-start-building')?.addEventListener('click', (e) => {
  e.preventDefault();
  const lang = initI18n();
  const prompt = lang === 'id'
    ? 'Hai! Saya tertarik membangun project baru bersama Manuver. Boleh bantu konsultasikan alur dan teknologinya?'
    : 'Hi! I am interested in building a new project with Manuver. Could you help consult on the workflow and technology?';
  if (window.openManuverChat) {
    window.openManuverChat(prompt);
  }
});

const defaultSupabaseUrl = 'https://pepmuztlrwctwgfryhwq.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcG11enRscndjdHdnZnJ5aHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MjExNjksImV4cCI6MjEwODI5NzE2OX0.9BhgQEVUUQdYp1McEE_gA26n_sjWKMmdtleagPphy3M';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl).trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey).trim();
const hasValidSupabaseConfig = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('YOUR_') &&
  !supabaseUrl.includes('PASTE_') &&
  !supabaseAnonKey.includes('YOUR_') &&
  !supabaseAnonKey.includes('PASTE_') &&
  !supabaseAnonKey.startsWith('sb_secret_')
);

const supabase = hasValidSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function signInWithGoogle() {
  if (!supabase) {
    alert('Supabase is not configured correctly.');
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

function updateAuthUI(user) {
  const signInEl = document.getElementById('sign-in-link');
  if (!signInEl) return;
  if (user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    signInEl.innerHTML = `<span title="${user.email}">👤 ${displayName} (Keluar)</span>`;
    signInEl.onclick = async (e) => {
      e.preventDefault();
      if (confirm(`Keluar dari akun ${user.email}?`)) {
        await supabase.auth.signOut();
        window.location.reload();
      }
    };
  } else {
    signInEl.innerHTML = `<span data-i18n="nav.signIn">${t('nav.signIn', initI18n())}</span>`;
    signInEl.onclick = (e) => {
      e.preventDefault();
      signInWithGoogle();
    };
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
  supabase.auth.getSession().then(({ data }) => {
    updateAuthUI(data?.session?.user || null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session?.user || null);
  });
}
