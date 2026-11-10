/**
 * ============================================================
 * Manuver Authenticated Customer Workspace Controller
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
  console.log('[DEBUG] bootstrapDashboard starting, search:', window.location.search);
  const loaderEl = document.getElementById('dashboard-loader');
  const appEl = document.getElementById('dashboard-app');
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === '1' || urlParams.get('preview') === 'true';
  console.log('[DEBUG] isPreview:', isPreview);

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
          created_at: new Date(Date.now() - 86400000).toISOString()
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
      currentProjects = Array.isArray(data.projects) ? data.projects : [];
      currentRequests = Array.isArray(data.briefs) ? data.briefs : [];
    } else {
      // Fallback: try individual endpoints
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
 * Update Sidebar & Panel Count Badges
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
      reqBadge.style.display = 'inline-flex';
    } else {
      reqBadge.style.display = 'none';
    }
  }

  if (projBadge) {
    if (currentProjects.length > 0) {
      projBadge.textContent = currentProjects.length;
      projBadge.style.display = 'inline-flex';
    } else {
      projBadge.style.display = 'none';
    }
  }
}

/**
 * 3. RENDER USER PROFILE
 */
function renderUserProfile(user) {
  const fullName = (user.name && user.name.trim()) || user.email?.split('@')[0] || 'User';
  const firstName = fullName.split(' ')[0] || fullName;
  const initial = (firstName[0] || 'M').toUpperCase();

  // Welcome Header
  const welcomeEl = document.getElementById('welcome-title');
  if (welcomeEl) {
    if (currentLang === 'id') {
      welcomeEl.textContent = `Selamat datang kembali, ${firstName}.`;
    } else {
      welcomeEl.textContent = `Welcome back, ${firstName}.`;
    }
  }

  // Header user name
  const headerNameEl = document.getElementById('header-user-firstname');
  if (headerNameEl) headerNameEl.textContent = firstName;

  // Sidebar user name & email
  const sidebarNameEl = document.getElementById('sidebar-user-name');
  const sidebarEmailEl = document.getElementById('sidebar-user-email');
  if (sidebarNameEl) sidebarNameEl.textContent = fullName;
  if (sidebarEmailEl) sidebarEmailEl.textContent = user.email || '';

  // Avatar slots
  const headerAvatarSlot = document.getElementById('header-avatar-slot');
  const sidebarAvatarSlot = document.getElementById('sidebar-avatar-slot');

  function renderAvatar(container, sizeClass) {
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
 * 4. RENDER PROJECTS
 */
function renderProjects(projects) {
  const overviewContainer = document.getElementById('overview-projects-container');
  const fullContainer = document.getElementById('full-projects-container');

  if (!projects || projects.length === 0) {
    const emptyHtml = `
      <div class="empty-state-box">
        <p class="empty-state-muted">${t('dashboard.emptyProjectsText', currentLang) || 'Belum ada proyek aktif.'}</p>
        <button type="button" class="btn-primary-action open-request-trigger">
          ${t('dashboard.btnShareIdea', currentLang) || 'Mulai Proyek'}
        </button>
      </div>
    `;
    if (overviewContainer) overviewContainer.innerHTML = emptyHtml;
    if (fullContainer) fullContainer.innerHTML = emptyHtml;
    return;
  }

  function buildProjectCard(p) {
    const progress = Math.min(Math.max(p.progress_percent || 25, 5), 100);
    const serviceLabel = formatCategoryLabel(p.service_type);
    const dateFormatted = p.updated_at ? formatDate(p.updated_at) : formatDate(p.created_at);

    return `
      <article class="data-card">
        <div class="data-card-top">
          <div>
            <h4 class="data-card-title">${escapeHtml(p.title || 'Project Manuver')}</h4>
            <span class="data-category-tag">${serviceLabel}</span>
          </div>
          <span class="status-badge status-badge--${p.status || 'in_progress'}">
            ${formatStatusLabel(p.status || 'in_progress')}
          </span>
        </div>
        <p class="data-card-desc">${escapeHtml(p.notes || '')}</p>
        <div class="progress-wrap" aria-label="Progress ${progress}%">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
        <div class="data-card-meta">
          <span>Progress: <strong>${progress}%</strong></span>
          <span>Diperbarui: ${dateFormatted}</span>
        </div>
      </article>
    `;
  }

  // Overview shows up to 2 items
  if (overviewContainer) {
    overviewContainer.innerHTML = `
      <div class="items-list-container">
        ${projects.slice(0, 2).map(buildProjectCard).join('')}
      </div>
    `;
  }

  // Full view shows all
  if (fullContainer) {
    fullContainer.innerHTML = `
      <div class="items-list-container">
        ${projects.map(buildProjectCard).join('')}
      </div>
    `;
  }
}

/**
 * 5. RENDER REQUESTS
 */
function renderRequests(requests) {
  const overviewContainer = document.getElementById('overview-requests-container');
  const fullContainer = document.getElementById('full-requests-container');

  if (!requests || requests.length === 0) {
    const emptyHtml = `
      <div class="empty-state-box">
        <p class="empty-state-muted">${t('dashboard.emptyRequestsText', currentLang) || 'Belum ada permintaan yang diajukan.'}</p>
        <button type="button" class="btn-primary-action open-request-trigger">
          ${t('dashboard.btnSubmitFirstRequest', currentLang) || 'Buat Permintaan'}
        </button>
      </div>
    `;
    if (overviewContainer) overviewContainer.innerHTML = emptyHtml;
    if (fullContainer) fullContainer.innerHTML = emptyHtml;
    return;
  }

  function buildRequestCard(req) {
    const categoryLabel = formatCategoryLabel(req.service_category);
    const status = req.status || 'received';
    const dateFormatted = formatDate(req.created_at);

    return `
      <article class="data-card">
        <div class="data-card-top">
          <div>
            <h4 class="data-card-title">${categoryLabel}</h4>
            <div class="data-card-meta">
              <span>Diajukan: ${dateFormatted}</span>
              ${req.target_timeline ? `<span>Timeline: ${formatTimelineLabel(req.target_timeline)}</span>` : ''}
            </div>
          </div>
          <span class="status-badge status-badge--${status}">
            ${formatStatusLabel(status)}
          </span>
        </div>
        <p class="data-card-desc">${escapeHtml(req.description || '')}</p>
      </article>
    `;
  }

  if (overviewContainer) {
    overviewContainer.innerHTML = `
      <div class="items-list-container">
        ${requests.slice(0, 3).map(buildRequestCard).join('')}
      </div>
    `;
  }

  if (fullContainer) {
    fullContainer.innerHTML = `
      <div class="items-list-container">
        ${requests.map(buildRequestCard).join('')}
      </div>
    `;
  }
}

/**
 * 6. RENDER RIGHT ACTIVITY PANEL (REFERENCE MATCH)
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
      <div class="panel-empty-box">
        <p class="panel-empty-text">${t('dashboard.emptyActivityText', currentLang) || 'Belum ada riwayat permintaan.'}</p>
      </div>
    `;
    return;
  }

  panelList.innerHTML = filtered.map((req) => {
    const categoryLabel = formatCategoryLabel(req.service_category);
    const status = req.status || 'received';
    const dateFormatted = formatDate(req.created_at);

    return `
      <div class="panel-card open-request-trigger" data-category="${req.service_category || ''}" role="button" tabindex="0">
        <div class="panel-card-head">
          <h4 class="panel-card-title">${categoryLabel}</h4>
          <span class="status-badge status-badge--${status}">${formatStatusLabel(status)}</span>
        </div>
        <p class="panel-card-desc">${escapeHtml(req.description || '')}</p>
        <div class="panel-card-foot">
          <span>${dateFormatted}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 6. NAVIGATION & VIEW SWITCHING
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

  // Cross-link buttons (e.g., "Lihat Semua ->")
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
function closeMobileSidebar() {
  document.getElementById('sidebar')?.classList.remove('is-open');
  document.getElementById('sidebar-backdrop')?.classList.remove('is-active');
}

function openMobileSidebar() {
  document.getElementById('sidebar')?.classList.add('is-open');
  document.getElementById('sidebar-backdrop')?.classList.add('is-active');
}

function setupSidebarToggle() {
  document.getElementById('sidebar-open-btn')?.addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-close-btn')?.addEventListener('click', closeMobileSidebar);
  document.getElementById('sidebar-backdrop')?.addEventListener('click', closeMobileSidebar);
}

function openRightPanel() {
  document.getElementById('right-activity-panel')?.classList.add('is-open');
  document.getElementById('right-panel-backdrop')?.classList.add('is-active');
}

function closeRightPanel() {
  document.getElementById('right-activity-panel')?.classList.remove('is-open');
  document.getElementById('right-panel-backdrop')?.classList.remove('is-active');
}

function setupRightPanelToggle() {
  document.getElementById('right-panel-toggle-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('right-activity-panel');
    if (panel?.classList.contains('is-open')) {
      closeRightPanel();
    } else {
      openRightPanel();
    }
  });
  document.getElementById('right-panel-close-btn')?.addEventListener('click', closeRightPanel);
  document.getElementById('right-panel-backdrop')?.addEventListener('click', closeRightPanel);
}

/**
 * 7. REAL REQUEST CREATION MODAL FLOW
 */
function setupModal() {
  const modal = document.getElementById('request-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('request-form');
  const errorBox = document.getElementById('request-error-box');
  const submitBtn = document.getElementById('request-submit-btn');
  const submitText = document.getElementById('btn-submit-text');
  const categorySelect = document.getElementById('req-category');

  function openModal(preselectedCategory = null) {
    if (modal) {
      if (preselectedCategory && categorySelect) {
        categorySelect.value = preselectedCategory;
      }
      if (errorBox) errorBox.style.display = 'none';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.getElementById('req-desc')?.focus();
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      if (errorBox) errorBox.style.display = 'none';
    }
  }

  // Bind all triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-request-trigger');
    if (trigger) {
      e.preventDefault();
      const cat = trigger.getAttribute('data-category');
      openModal(cat);
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Close on backdrop
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) {
      closeModal();
    }
  });

  // Handle Form Submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = categorySelect?.value;
    const desc = document.getElementById('req-desc')?.value?.trim();
    const timeline = document.getElementById('req-timeline')?.value;
    const budget = document.getElementById('req-budget')?.value;

    if (!desc) {
      if (errorBox) {
        errorBox.textContent = currentLang === 'id' ? 'Deskripsi kebutuhan wajib diisi.' : 'Description is required.';
        errorBox.style.display = 'block';
      }
      return;
    }

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = t('dashboard.btnSubmitting', currentLang);
    if (errorBox) errorBox.style.display = 'none';

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceCategory: category,
          description: desc,
          targetTimeline: timeline,
          budgetRange: budget
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Reset form and close
        form.reset();
        closeModal();

        // Show toast
        showToast(t('dashboard.toastSuccess', currentLang), 'success');

        // Prepend optimistic or refresh
        if (result.request) {
          currentRequests = [result.request, ...currentRequests];
          renderRequests(currentRequests);
          renderRightPanel(currentRequests);
          updateCounts();
        } else {
          loadDashboardData();
        }
      } else {
        const msg = result.error || t('dashboard.toastError', currentLang);
        if (errorBox) {
          errorBox.textContent = msg;
          errorBox.style.display = 'block';
        }
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = currentLang === 'id' ? 'Terjadi kesalahan jaringan. Coba lagi.' : 'Network error. Please try again.';
        errorBox.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = t('dashboard.btnSubmitRequest', currentLang);
    }
  });
}

/**
 * 8. SIGN OUT ACTION
 */
async function handleSignOut() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (_) {}
  window.location.replace('/');
}

/**
 * 9. TOAST NOTIFICATION
 */
function showToast(message, type = 'success') {
  const toast = document.getElementById('app-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast-popup is-visible is-${type}`;

  setTimeout(() => {
    toast.className = 'toast-popup';
  }, 4000);
}

/**
 * HELPER FORMATTERS
 */
function formatCategoryLabel(cat) {
  const map = {
    workflow_automation: currentLang === 'id' ? 'Otomasi Alur Kerja' : 'Workflow Automation',
    web_application: currentLang === 'id' ? 'Aplikasi Web / SaaS' : 'Web Application / SaaS',
    custom_ai: currentLang === 'id' ? 'Solusi AI Kustom' : 'Custom AI Solution',
    all_in_one: currentLang === 'id' ? 'Sistem Komprehensif' : 'End-to-End System',
    other: currentLang === 'id' ? 'Lainnya' : 'Other'
  };
  return map[cat] || cat || 'General';
}

function formatStatusLabel(st) {
  const map = {
    received: t('dashboard.statusReceived', currentLang),
    pending: t('dashboard.statusReceived', currentLang),
    under_review: t('dashboard.statusUnderReview', currentLang),
    in_discussion: t('dashboard.statusInDiscussion', currentLang),
    in_progress: t('dashboard.statusInProgress', currentLang),
    development: t('dashboard.statusInProgress', currentLang),
    discovery: currentLang === 'id' ? 'Discovery' : 'Discovery',
    completed: t('dashboard.statusCompleted', currentLang)
  };
  return map[st] || st || 'Active';
}

function formatTimelineLabel(tl) {
  const map = {
    urgent: currentLang === 'id' ? '3–7 Hari' : '3–7 Days',
    standard: currentLang === 'id' ? '1–2 Minggu' : '1–2 Weeks',
    flexible: currentLang === 'id' ? 'Fleksibel' : 'Flexible'
  };
  return map[tl] || tl;
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
