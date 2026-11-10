import { initI18n, t, onLanguageChange } from './i18n.js';

/**
 * Minimal Authenticated Dashboard Logic (Manuver)
 */

// Initialize i18n
const initialLang = initI18n();

// Update document title based on i18n
function updateTitle(lang) {
  document.title = t('dashboard.metaTitle', lang) || 'Dashboard · Manuver';
}
updateTitle(initialLang);
onLanguageChange((lang) => updateTitle(lang));

// Safeguard against Back-Forward Cache (bfcache)
// If the user logs out and hits the back button, immediately force a fresh session verification
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

/**
 * Verify session with GET /api/me
 */
async function checkSession() {
  const loaderEl = document.getElementById('dashboard-loader');
  const appEl = document.getElementById('dashboard-app');

  try {
    const res = await fetch('/api/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      // 401 or invalid session -> redirect immediately to landing page
      window.location.replace('/');
      return;
    }

    const user = await res.json();
    if (!user || !user.id) {
      window.location.replace('/');
      return;
    }

    // Populate user profile info in top bar
    populateUser(user);

    // Reveal dashboard and dismiss neutral loading screen
    appEl.classList.add('visible');
    loaderEl.classList.add('hidden');
    loaderEl.setAttribute('aria-hidden', 'true');

  } catch (err) {
    // Network or server error -> redirect safely
    window.location.replace('/');
  }
}

/**
 * Populate user avatar and first name
 */
function populateUser(user) {
  const userNameEl = document.getElementById('user-display-name');
  const avatarSlotEl = document.getElementById('user-avatar-slot');

  const fullName = (user.name && user.name.trim()) || user.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0] || fullName;

  if (userNameEl) {
    userNameEl.textContent = firstName;
  }

  // Fallback initials
  const initial = (firstName[0] || 'U').toUpperCase();

  if (avatarSlotEl) {
    if (user.avatarUrl) {
      const img = document.createElement('img');
      img.className = 'user-avatar';
      img.src = user.avatarUrl;
      img.alt = fullName;
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        // Fallback to initials if Google avatar fails to load
        avatarSlotEl.innerHTML = `<span class="user-initials" aria-hidden="true">${initial}</span>`;
      };
      avatarSlotEl.innerHTML = '';
      avatarSlotEl.appendChild(img);
    } else {
      avatarSlotEl.innerHTML = `<span class="user-initials" aria-hidden="true">${initial}</span>`;
    }
  }
}

/**
 * Sign out action
 */
async function handleSignOut() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    // Continue even on network issue
  } finally {
    window.location.replace('/');
  }
}

/**
 * Modal state management
 */
function setupModal() {
  const modal = document.getElementById('connect-modal');
  const openBtn = document.getElementById('btn-connect-first');
  const closeBtn = document.getElementById('btn-modal-close');

  if (!modal || !openBtn || !closeBtn) return;

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    openBtn.focus();
  }

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  // Close when clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// Bind sign out button
document.getElementById('btn-signout')?.addEventListener('click', (e) => {
  e.preventDefault();
  handleSignOut();
});

// Setup modal handlers
setupModal();

// Check session immediately
checkSession();
