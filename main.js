import { initI18n, t } from './src/i18n.js';
import { initChatWidget } from './src/ChatWidget.js';

// Initialize i18n & language switcher
initI18n();

// Initialize Manuver AI Assistant Chat Widget
initChatWidget();

// Connect Hero CTA buttons to open consultative AI discovery
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

document.querySelector('#hero-see-how')?.addEventListener('click', (e) => {
  e.preventDefault();
  const lang = initI18n();
  const prompt = lang === 'id'
    ? 'Bagaimana cara kerja Manuver dalam mengotomasi operasional bisnis?'
    : 'How does Manuver work to automate business operations and workflow?';
  if (window.openManuverChat) {
    window.openManuverChat(prompt);
  }
});

// Clean up OAuth query parameters from URL after login
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('auth') === 'success') {
  window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Trigger Node Express / PostgreSQL Google OAuth flow
 */
export function signInWithGoogle() {
  window.location.href = '/api/auth/google';
}

/**
 * Navigate to the authenticated client dashboard.
 * If not logged in, initiates Google OAuth.
 */
export function openClientDashboard() {
  fetch('/api/me', { credentials: 'include', headers: { Accept: 'application/json' } })
    .then((r) => {
      if (r.ok) {
        window.location.href = '/dashboard';
      } else {
        signInWithGoogle();
      }
    })
    .catch(() => signInWithGoogle());
}

/**
 * Updates navbar UI based on authentication state
 */
export function updateAuthUI(user) {
  const signInEl = document.getElementById('sign-in-link');
  const googleLoginBtn = document.getElementById('google-login');
  if (!signInEl) return;

  if (user) {
    const displayName = user.name || user.email?.split('@')[0] || 'User';
    const avatar = user.avatarUrl
      ? `<img src="${user.avatarUrl}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle;margin-right:6px;border:1.5px solid var(--accent);" alt="" />`
      : '👤 ';

    signInEl.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        <span class="user-portal-trigger" title="Buka Dashboard (${user.email})" style="display:inline-flex;align-items:center;cursor:pointer;">
          ${avatar}<span>${displayName}</span>
        </span>
        <button type="button" class="user-quick-logout" title="Keluar dari akun" style="background:none;border:none;color:var(--dim);font-size:12px;cursor:pointer;padding:0 2px;opacity:0.75;">(Keluar)</button>
      </span>
    `;

    const portalTrigger = signInEl.querySelector('.user-portal-trigger');
    const quickLogout = signInEl.querySelector('.user-quick-logout');

    portalTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = '/dashboard';
    });

    quickLogout?.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Keluar dari akun ${user.email}?`)) {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        window.location.reload();
      }
    });

    if (googleLoginBtn) {
      googleLoginBtn.innerHTML = `<span>🚀 Client Portal</span>`;
      googleLoginBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/dashboard';
      };
    }
  } else {
    signInEl.innerHTML = `<span data-i18n="nav.signIn">${t('nav.signIn', initI18n())}</span>`;
    signInEl.onclick = (e) => {
      e.preventDefault();
      signInWithGoogle();
    };

    if (googleLoginBtn) {
      googleLoginBtn.innerHTML = `<span data-i18n="nav.getStarted">${t('nav.getStarted', initI18n())}</span>`;
      googleLoginBtn.onclick = (e) => {
        e.preventDefault();
        signInWithGoogle();
      };
    }
  }
}

// Connect Sign-In link in navigation
const signInLink = document.getElementById('sign-in-link');
if (signInLink) {
  signInLink.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

const googleLoginBtn = document.getElementById('google-login');
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    signInWithGoogle();
  });
}

// Check logged in user status from PostgreSQL backend on page load
fetch('/api/me', { credentials: 'include', headers: { Accept: 'application/json' } })
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => {
    updateAuthUI(data || null);
  })
  .catch(() => {
    updateAuthUI(null);
  });

// Header proximity & particle blending effect
const navHeader = document.querySelector('.nav-header');
if (navHeader) {
  window.addEventListener('pointermove', (e) => {
    if (e.clientY <= 80 || navHeader.matches(':hover')) {
      navHeader.classList.add('nav-active');
    } else {
      navHeader.classList.remove('nav-active');
    }
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navHeader.classList.add('nav-scrolled');
    } else {
      navHeader.classList.remove('nav-scrolled');
    }
  }, { passive: true });
}
