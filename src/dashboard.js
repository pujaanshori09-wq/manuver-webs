/**
 * ============================================================
 * Manuver Authenticated Customer Workspace Controller
 * Hand-designed, Bespoke Architecture
 * ============================================================
 */

import { initI18n, t, getCurrentLanguage, setLanguage, onLanguageChange } from './i18n.js';
import { initChatWidget } from './ChatWidget.js';

let currentUser = null;
let currentProjects = [];
let currentRequests = [];
let activeView = 'overview';

// Initialize i18n
let currentLang = initI18n();

// Initialize Manuver AI Chat Assistant floating widget
try {
  initChatWidget();
} catch (e) {
  console.warn('[Assistant] Initialization notice:', e);
}

// bfcache protection
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

/**
 * Update Document Title based on active language and view
 */
function updatePageTitle() {
  const baseTitle = t('dashboard.metaTitle', currentLang) || 'Dashboard · Manuver';
  document.title = baseTitle;
}
updatePageTitle();

onLanguageChange((lang) => {
  currentLang = lang;
  updatePageTitle();
  if (currentUser) {
    renderUserProfile(currentUser);
    renderProjects(currentProjects);
    renderRequests(currentRequests);
    renderRightPanel(currentRequests);
  }
});

/**
 * 1. SESSION VERIFICATION & BOOTSTRAP
 */
async function bootstrapDashboard() {
  const loaderEl = document.getElementById('dashboard-loader');
  const appEl = document.getElementById('dashboard-app');
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === '1' || urlParams.get('preview') === 'true';

  try {
    if (isPreview) {
      const mockUser = {
        id: 'user-preview-123',
        name: 'Puja Anshori',
        email: 'pujaanshori09@gmail.com'
      };
      currentUser = mockUser;
      renderUserProfile(mockUser);
      currentRequests = [
        {
          id: 'req-1',
          service_category: 'workflow_automation',
          description: 'Otomasi alur kerja WhatsApp notifikasi pesanan dan sinkronisasi CRM real-time.',
          status: 'in_progress',
          created_at: new Date().toISOString()
        },
        {
          id: 'req-2',
          service_category: 'web_application',
          description: 'Pengembangan portal klien modern berkecepatan tinggi dengan sistem brief terpadu.',
          status: 'under_review',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString()
        }
      ];
      renderProjects(currentProjects);
      renderRequests(currentRequests);
      renderRightPanel(currentRequests);
      updateCounts();
    } else {
      const res = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!res.ok) {
        window.location.replace('/');
        return;
      }

      const user = await res.json();
      if (!user || !user.id) {
        window.location.replace('/');
        return;
      }

      currentUser = user;
      renderUserProfile(user);

      // Fetch initial customer data
      await loadDashboardData();
    }

    // Reveal workspace
    appEl.classList.add('is-ready');
    appEl.setAttribute('aria-hidden', 'false');
    loaderEl.classList.add('hidden');
    loaderEl.setAttribute('aria-hidden', 'true');

    setupNavigation();
    setupModal();
    setupPrimaryInput();
    setupStickyButtonObserver();
    setupSidebarToggle();
    setupRightPanelToggle();

    document.getElementById('panel-search-input')?.addEventListener('input', () => {
      renderRightPanel(currentRequests);
    });
  } catch (err) {
    window.location.replace('/');
  }
}

/**
 * 2. FETCH REAL DASHBOARD DATA
 */
async function loadDashboardData() {
  try {
    const res = await fetch('/api/dashboard/data', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      currentProjects = data.projects || [];
      currentRequests = data.briefs || [];
    } else {
      const [pRes, rRes] = await Promise.allSettled([
        fetch('/api/projects', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/requests', { credentials: 'include' }).then((r) => r.json())
      ]);
      if (pRes.status === 'fulfilled' && pRes.value.projects) currentProjects = pRes.value.projects;
      if (rRes.status === 'fulfilled' && rRes.value.requests) currentRequests = rRes.value.requests;
    }
  } catch (err) {
    console.warn('[Dashboard Data] Notice:', err);
  }

  // Render lists
  renderProjects(currentProjects);
  renderRequests(currentRequests);
  renderRightPanel(currentRequests);
  updateCounts();
}

/**
 * Update Sidebar & Panel Counts (Plain muted numbers, tabular)
 */
function updateCounts() {
  const reqBadge = document.getElementById('badge-requests-count');
  const projBadge = document.getElementById('badge-projects-count');
  const panelBadge = document.getElementById('panel-requests-badge');

  if (panelBadge) {
    panelBadge.textContent = currentRequests.length;
  }

  if (reqBadge) {
    if (currentRequests.length > 0) {
      reqBadge.textContent = currentRequests.length;
      reqBadge.style.display = 'inline';
    } else {
      reqBadge.style.display = 'none';
    }
  }

  if (projBadge) {
    if (currentProjects.length > 0) {
      projBadge.textContent = currentProjects.length;
      projBadge.style.display = 'inline';
    } else {
      projBadge.style.display = 'none';
    }
  }
}

/**
 * 3. RENDER USER PROFILE (56px H1 with accent dot)
 */
function renderUserProfile(user) {
  const fullName = (user.name && user.name.trim()) || user.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0] || fullName;
  const initial = (firstName[0] || 'P').toUpperCase();

  // Overview Header: small kicker + H1 with accent period
  const kickerEl = document.getElementById('welcome-kicker');
  const welcomeH1 = document.getElementById('welcome-h1');
  if (kickerEl) {
    kickerEl.textContent = t('dashboard.welcomeKicker', currentLang) || 'Selamat datang kembali';
  }
  if (welcomeH1) {
    welcomeH1.innerHTML = `${escapeHtml(firstName)}<span class="accent-dot">.</span>`;
  }

  // Sidebar user name & email
  const sidebarNameEl = document.getElementById('sidebar-user-name');
  const sidebarEmailEl = document.getElementById('sidebar-user-email');
  if (sidebarNameEl) sidebarNameEl.textContent = fullName;
  if (sidebarEmailEl) sidebarEmailEl.textContent = user.email || '';

  // Avatar slots (28px clean)
  const headerAvatarSlot = document.getElementById('header-avatar-slot');
  const sidebarAvatarSlot = document.getElementById('sidebar-avatar-slot');

  function renderAvatar(container) {
    if (!container) return;
    if (user.avatarUrl) {
      const img = document.createElement('img');
      img.src = user.avatarUrl;
      img.alt = fullName;
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        container.innerHTML = `<span class="avatar-fallback">${initial}</span>`;
      };
      container.innerHTML = '';
      container.appendChild(img);
    } else {
      container.innerHTML = `<span class="avatar-fallback">${initial}</span>`;
    }
  }

  renderAvatar(headerAvatarSlot);
  renderAvatar(sidebarAvatarSlot);
}

/**
 * 4. RENDER PROJECTS (Left-aligned, clean, no big box)
 */
function renderProjects(projects) {
  const overviewContainer = document.getElementById('overview-projects-container');
  const fullContainer = document.getElementById('full-projects-container');

  if (!projects || projects.length === 0) {
    const emptyHtml = `
      <div class="empty-state-clean">
        <span class="empty-state-sentence">${t('dashboard.emptyProjectsText', currentLang)}</span>
        <button type="button" class="btn-quiet-action open-request-trigger">
          ${t('dashboard.btnStartRequestSmall', currentLang)} &rarr;
        </button>
      </div>
    `;
    if (overviewContainer) overviewContainer.innerHTML = emptyHtml;
    if (fullContainer) fullContainer.innerHTML = emptyHtml;
    return;
  }

  function buildProjectRow(p) {
    const serviceLabel = formatCategoryLabel(p.service_type);
    const dateFormatted = p.updated_at ? formatDate(p.updated_at) : formatDate(p.created_at);

    return `
      <div class="project-list-row">
        <div class="project-list-left">
          <span class="project-list-title">${escapeHtml(p.title || 'Project Manuver')}</span>
          <span class="project-list-meta">${serviceLabel} · ${dateFormatted}</span>
        </div>
        <div class="status-indicator status-indicator--${p.status || 'in_progress'}">
          <span class="status-dot"></span>
          <span>${formatStatusLabel(p.status || 'in_progress')}</span>
        </div>
      </div>
    `;
  }

  if (overviewContainer) {
    overviewContainer.innerHTML = projects.slice(0, 3).map(buildProjectRow).join('');
  }

  if (fullContainer) {
    fullContainer.innerHTML = projects.map(buildProjectRow).join('');
  }
}

/**
 * 5. RENDER REQUESTS (Compact Table: 44px rows, 1px dividers, no card wrapper)
 */
function renderRequests(requests) {
  const overviewContainer = document.getElementById('overview-requests-container');
  const fullContainer = document.getElementById('full-requests-container');

  if (!requests || requests.length === 0) {
    const emptyHtml = `
      <div class="empty-state-clean">
        <span class="empty-state-sentence">${t('dashboard.emptyRequestsText', currentLang)}</span>
        <button type="button" class="btn-quiet-action open-request-trigger">
          ${t('dashboard.btnStartRequestSmall', currentLang)} &rarr;
        </button>
      </div>
    `;
    if (overviewContainer) overviewContainer.innerHTML = emptyHtml;
    if (fullContainer) fullContainer.innerHTML = emptyHtml;
    return;
  }

  function buildTable(items) {
    return `
      <div class="table-outer-wrapper">
        <table class="compact-table" role="table">
          <thead>
            <tr>
              <th scope="col">${t('dashboard.colRequest', currentLang)}</th>
              <th scope="col">${t('dashboard.colCategory', currentLang)}</th>
              <th scope="col">${t('dashboard.colStatus', currentLang)}</th>
              <th scope="col">${t('dashboard.colDate', currentLang)}</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((req) => {
              const status = req.status || 'received';
              return `
                <tr class="table-row-clickable open-request-trigger" data-category="${req.service_category || ''}">
                  <td class="table-cell-desc">${escapeHtml(req.description || 'Brief')}</td>
                  <td class="table-cell-category">${formatCategoryLabel(req.service_category)}</td>
                  <td>
                    <span class="status-indicator status-indicator--${status}">
                      <span class="status-dot"></span>
                      <span>${formatStatusLabel(status)}</span>
                    </span>
                  </td>
                  <td class="table-cell-date">${formatDate(req.created_at)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (overviewContainer) {
    overviewContainer.innerHTML = buildTable(requests.slice(0, 5));
  }

  if (fullContainer) {
    fullContainer.innerHTML = buildTable(requests);
  }
}

/**
 * 6. RENDER RIGHT ACTIVITY PANEL (Vertical Timeline: 1px line, 8px dot)
 */
function renderRightPanel(requests) {
  const panelList = document.getElementById('panel-activity-list');
  const panelBadge = document.getElementById('panel-requests-badge');
  if (panelBadge) panelBadge.textContent = requests ? requests.length : 0;
  if (!panelList) return;

  const searchInput = document.getElementById('panel-search-input');
  const searchTerm = (searchInput?.value || '').toLowerCase().trim();

  const filtered = (requests || []).filter((r) => {
    if (!searchTerm) return true;
    const cat = formatCategoryLabel(r.service_category).toLowerCase();
    const desc = (r.description || '').toLowerCase();
    return cat.includes(searchTerm) || desc.includes(searchTerm);
  });

  if (!filtered || filtered.length === 0) {
    panelList.innerHTML = `
      <p class="panel-empty-text">${t('dashboard.emptyActivityText', currentLang)}</p>
    `;
    return;
  }

  panelList.innerHTML = `
    <div class="timeline-track">
      ${filtered.map((req) => {
        const status = req.status || 'received';
        const timeAgo = formatRelativeTime(req.created_at);

        return `
          <div class="timeline-item open-request-trigger" data-category="${req.service_category || ''}" role="button" tabindex="0">
            <div class="timeline-dot timeline-dot--${status}"></div>
            <div class="timeline-body">
              <h4 class="timeline-title">${formatCategoryLabel(req.service_category)}</h4>
              <p class="timeline-desc">${escapeHtml(req.description || '')}</p>
              <span class="timeline-time">${timeAgo}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * 7. PRIMARY INPUT ROW INTERACTION
 */
function setupPrimaryInput() {
  const inputEl = document.getElementById('primary-request-input');
  const submitBtn = document.getElementById('primary-request-submit-btn');

  function triggerFromInput() {
    const val = inputEl?.value.trim() || '';
    const descTextarea = document.getElementById('request-description');
    if (descTextarea && val) {
      descTextarea.value = val;
    }
    openModal();
  }

  submitBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerFromInput();
  });

  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerFromInput();
    }
  });
}

/**
 * 8. INTERSECTION OBSERVER: Hide Sticky Button when Main CTA Input is in View
 */
function setupStickyButtonObserver() {
  const primaryBox = document.getElementById('primary-request-box');
  const panelFooter = document.getElementById('right-panel-footer');
  if (!primaryBox || !panelFooter) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        panelFooter.classList.add('is-hidden');
      } else {
        panelFooter.classList.remove('is-hidden');
      }
    });
  }, {
    root: document.getElementById('main-layout-container') || null,
    threshold: 0.2
  });

  observer.observe(primaryBox);
}

/**
 * 9. NAVIGATION & VIEW SWITCHING
 */
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item[data-view]');
  const headerContextTitle = document.getElementById('header-context-title');

  function switchView(targetView) {
    activeView = targetView;

    // Update active nav button
    navButtons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-view') === targetView;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      if (isTarget) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Update viewport panels
    document.querySelectorAll('.view-panel').forEach((panel) => {
      panel.style.display = 'none';
      panel.classList.remove('is-active');
    });

    const activePanel = document.getElementById(`view-${targetView}`);
    if (activePanel) {
      activePanel.style.display = 'flex';
      activePanel.classList.add('is-active');
    }

    // Update header contextual title
    if (headerContextTitle) {
      const titles = {
        overview: t('dashboard.headerOverview', currentLang),
        requests: t('dashboard.headerRequests', currentLang),
        projects: t('dashboard.headerProjects', currentLang),
        products: t('dashboard.headerProducts', currentLang),
        help: t('dashboard.headerHelp', currentLang)
      };
      headerContextTitle.textContent = titles[targetView] || 'Workspace';
    }

    // Close mobile sidebar if open
    closeMobileSidebar();
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const view = btn.getAttribute('data-view');
      if (view) switchView(view);
    });
  });

  // Cross-link buttons (e.g., "Lihat semua ->")
  document.querySelectorAll('.nav-switch-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target');
      if (target) switchView(target);
    });
  });

  // Sign out handler
  document.getElementById('sidebar-logout-btn')?.addEventListener('click', handleSignOut);
}

/**
 * Mobile Sidebar Drawer Handlers
 */
function setupSidebarToggle() {
  const openBtn = document.getElementById('sidebar-open-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');
  const backdrop = document.getElementById('sidebar-backdrop');
  const sidebar = document.getElementById('sidebar');

  openBtn?.addEventListener('click', () => {
    sidebar?.classList.add('is-open');
    backdrop?.classList.add('is-active');
  });

  closeBtn?.addEventListener('click', closeMobileSidebar);
  backdrop?.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('is-open');
  document.getElementById('sidebar-backdrop')?.classList.remove('is-active');
}

/**
 * Responsive Right Panel Toggle (<1280px)
 */
function setupRightPanelToggle() {
  const toggleBtn = document.getElementById('right-panel-toggle-btn');
  const closeBtn = document.getElementById('right-panel-close-btn');
  const backdrop = document.getElementById('right-panel-backdrop');
  const panel = document.getElementById('right-activity-panel');

  function openPanel() {
    panel?.classList.add('is-open');
    backdrop?.classList.add('is-active');
  }

  function closePanel() {
    panel?.classList.remove('is-open');
    backdrop?.classList.remove('is-active');
  }

  toggleBtn?.addEventListener('click', openPanel);
  closeBtn?.addEventListener('click', closePanel);
  backdrop?.addEventListener('click', closePanel);
}

/**
 * 10. REAL REQUEST CREATION MODAL
 */
function setupModal() {
  const modal = document.getElementById('request-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('new-request-form');
  const errorAlert = document.getElementById('request-form-error');

  // Trigger buttons
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-request-trigger');
    if (!trigger) return;
    e.preventDefault();

    const category = trigger.getAttribute('data-category');
    if (category) {
      const select = document.getElementById('request-service-category');
      if (select) select.value = category;
    }

    openModal();
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorAlert) errorAlert.style.display = 'none';

    const submitBtn = document.getElementById('request-submit-btn');
    const originalText = submitBtn?.textContent || 'Kirimkan Permintaan';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t('dashboard.btnSubmitting', currentLang) || 'Mengirim...';
    }

    const payload = {
      service_category: document.getElementById('request-service-category')?.value || 'workflow_automation',
      description: document.getElementById('request-description')?.value.trim() || '',
      target_timeline: document.getElementById('request-timeline')?.value || 'standard',
      budget_tier: document.getElementById('request-budget')?.value || 'flexible'
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan permintaan');
      }

      const created = await res.json();
      currentRequests.unshift(created.request || {
        id: 'req-' + Date.now(),
        ...payload,
        status: 'received',
        created_at: new Date().toISOString()
      });

      renderRequests(currentRequests);
      renderRightPanel(currentRequests);
      updateCounts();

      closeModal();
      form.reset();
      showToast(t('dashboard.toastSuccess', currentLang) || 'Permintaan berhasil dikirim!');
    } catch (err) {
      if (errorAlert) {
        errorAlert.textContent = err.message || t('dashboard.toastError', currentLang);
        errorAlert.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
}

function openModal() {
  const modal = document.getElementById('request-modal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    document.getElementById('request-description')?.focus();
  }, 100);
}

function closeModal() {
  const modal = document.getElementById('request-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * 11. SIGN OUT HANDLER
 */
async function handleSignOut() {
  try {
    await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (_) {
    // Ignore error
  }
  window.location.replace('/');
}

/**
 * Toast Notification Utility
 */
function showToast(message) {
  const toast = document.getElementById('dashboard-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 3400);
}

/**
 * Relative time formatter for vertical timeline
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((Date.now() - then) / 1000);
    if (diff < 60) return currentLang === 'id' ? 'Baru saja' : 'Just now';
    if (diff < 3600) {
      const m = Math.floor(diff / 60);
      return currentLang === 'id' ? `${m}m lalu` : `${m}m ago`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return currentLang === 'id' ? `${h} jam lalu` : `${h}h ago`;
    }
    const d = Math.floor(diff / 86400);
    return currentLang === 'id' ? `${d} hari lalu` : `${d}d ago`;
  } catch (_) {
    return formatDate(dateStr);
  }
}

/**
 * Format Helpers
 */
function formatCategoryLabel(cat) {
  const map = {
    workflow_automation: t('dashboard.categoryAutomation', currentLang) || 'Otomasi Alur Kerja',
    web_application: t('dashboard.categoryWeb', currentLang) || 'Aplikasi Web & SaaS',
    custom_ai: t('dashboard.categoryAi', currentLang) || 'Solusi AI Kustom',
    all_in_one: t('dashboard.categoryComprehensive', currentLang) || 'Sistem End-to-End',
    other: t('dashboard.categoryOther', currentLang) || 'Lainnya / Kustom'
  };
  return map[cat] || cat || 'General';
}

function formatStatusLabel(st) {
  const map = {
    received: t('dashboard.statusReceived', currentLang),
    under_review: t('dashboard.statusUnderReview', currentLang),
    in_discussion: t('dashboard.statusInDiscussion', currentLang),
    in_progress: t('dashboard.statusInProgress', currentLang),
    development: t('dashboard.statusInProgress', currentLang),
    completed: t('dashboard.statusCompleted', currentLang)
  };
  return map[st] || st || 'Active';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (_) {
    return dateStr;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start application bootstrap immediately
bootstrapDashboard();
