/**
 * ============================================================
 * Manuver Client Portal & Project Tracker (Modal / Hub)
 * Connected to PostgreSQL via /api/auth/dashboard & /api/auth/brief
 * ============================================================
 */

import './ClientPortal.css';
import { WHATSAPP_NUMBER } from '../api/knowledge.js';

let portalContainer = null;
let currentDashboardData = null;

export function initClientPortal() {
  if (document.getElementById('manuver-client-portal')) return;

  portalContainer = document.createElement('div');
  portalContainer.id = 'manuver-client-portal';
  portalContainer.innerHTML = `
    <div class="portal-backdrop" id="portal-backdrop"></div>
    <div class="portal-modal" id="portal-modal" role="dialog" aria-modal="true" aria-labelledby="portal-title">
      <!-- Header -->
      <div class="portal-header">
        <div class="portal-brand">
          <img class="portal-user-avatar" id="portal-avatar" src="" alt="User Avatar" />
          <div class="portal-user-meta">
            <h3 id="portal-user-name">Client Portal <span class="portal-badge-pro">Active Client</span></h3>
            <p id="portal-user-email">client@example.com</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" class="portal-logout-btn" id="portal-logout-btn" title="Keluar dari akun">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Keluar</span>
          </button>
          <button type="button" class="portal-close-btn" id="portal-close-btn" aria-label="Close Portal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="portal-nav-tabs">
        <button type="button" class="portal-tab-btn is-active" data-tab="tracker">🚀 Project Tracker</button>
        <button type="button" class="portal-tab-btn" data-tab="brief">📝 Ajukan Project Baru</button>
        <button type="button" class="portal-tab-btn" data-tab="roi">⚡ Efisiensi Jam Kerja</button>
      </div>

      <!-- Content Area -->
      <div class="portal-content">
        <!-- 1. TAB: Project Tracker -->
        <div class="portal-pane is-active" id="pane-tracker">
          <div id="portal-projects-list">
            <div class="portal-card">
              <div class="portal-card-head">
                <h4 class="portal-card-title">Discovery & Arsitektur Alur Kerja</h4>
                <span class="portal-status-pill portal-status-pill--discovery">Fase 1: Discovery</span>
              </div>
              <p style="font-size:13.5px; color:rgba(244,243,240,0.65); margin:0 0 8px;">
                Tim Manuver sedang memetakan proses manual repetitif Anda untuk mengotomasi alur kerja dan integrasi database.
              </p>
              <div class="portal-progress-bar-wrap">
                <div class="portal-progress-bar-fill" style="width: 25%;"></div>
              </div>
              <div class="portal-timeline">
                <div class="portal-timeline-step is-passed">
                  <div class="portal-timeline-step-num">01</div>
                  <div class="portal-timeline-step-label">Discovery</div>
                </div>
                <div class="portal-timeline-step">
                  <div class="portal-timeline-step-num">02</div>
                  <div class="portal-timeline-step-label">Arsitektur</div>
                </div>
                <div class="portal-timeline-step">
                  <div class="portal-timeline-step-num">03</div>
                  <div class="portal-timeline-step-label">Fast Build</div>
                </div>
                <div class="portal-timeline-step">
                  <div class="portal-timeline-step-num">04</div>
                  <div class="portal-timeline-step-label">Garansi 30 Hari</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. TAB: Ajukan Project Baru -->
        <div class="portal-pane" id="pane-brief">
          <div class="portal-alert-success" id="portal-brief-success">
            ✅ Brief project Anda berhasil dikirim ke PostgreSQL! Tim Manuver akan segera memproses estimasi alur dan biayanya.
          </div>
          <form id="portal-brief-form">
            <div class="portal-form-group">
              <label class="portal-form-label">Kategori Solusi yang Dibutuhkan</label>
              <select class="portal-form-select" id="brief-category" required>
                <option value="workflow_automation">Otomasi Alur Kerja (Sheets, CRM, WhatsApp Bot, Webhook)</option>
                <option value="web_application">Aplikasi Web / Landing Page Modern Berkecepatan Tinggi</option>
                <option value="custom_ai">Solusi AI Kustom (Asisten CS Pintar, Ekstraksi Data)</option>
                <option value="all_in_one">Solusi Komprehensif (Web + Otomasi + AI)</option>
              </select>
            </div>
            <div class="portal-form-group">
              <label class="portal-form-label">Deskripsikan Kebutuhan atau Masalah Bisnis Anda</label>
              <textarea class="portal-form-textarea" id="brief-description" rows="4" placeholder="Contoh: Kami ingin menghubungkan form pesanan ke spreadsheet dan mengirim notifikasi WhatsApp otomatis ke pembeli..." required></textarea>
            </div>
            <div class="portal-form-group">
              <label class="portal-form-label">Target Timeline Pengerjaan</label>
              <select class="portal-form-select" id="brief-timeline">
                <option value="urgent">Mendesak (3–7 Hari Kerja)</option>
                <option value="standard" selected>Standar (1–2 Minggu)</option>
                <option value="flexible">Fleksibel (2–4 Minggu)</option>
              </select>
            </div>
            <button type="submit" class="portal-btn-primary" id="brief-submit-btn">
              <span>Kirimkan Brief ke Tim Manuver &rarr;</span>
            </button>
          </form>
        </div>

        <!-- 3. TAB: Efisiensi Jam Kerja -->
        <div class="portal-pane" id="pane-roi">
          <div class="portal-metrics-grid">
            <div class="portal-metric-card">
              <div class="portal-metric-label">Potensi Hemat Waktu</div>
              <div class="portal-metric-val portal-metric-val--orange" id="portal-roi-monthly">~51 Jam</div>
              <div class="portal-metric-label">per bulan</div>
            </div>
            <div class="portal-metric-card">
              <div class="portal-metric-label">Penghematan Setahun</div>
              <div class="portal-metric-val" id="portal-roi-annual">~612 Jam</div>
              <div class="portal-metric-label">waktu tim diselamatkan</div>
            </div>
            <div class="portal-metric-card">
              <div class="portal-metric-label">Peningkatan Efisiensi</div>
              <div class="portal-metric-val" style="color:#4ade80;">+78%</div>
              <div class="portal-metric-label">eliminasi tugas repetitif</div>
            </div>
          </div>
          <p style="font-size:13.5px; color:rgba(244,243,240,0.6); text-align:center;">
            Data di atas dihitung berdasarkan metrik efisiensi sistem otomasi Manuver. Ingin langsung merealisasikannya?
          </p>
          <div style="text-align:center; margin-top:16px;">
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Halo%20Manuver,%20saya%20sudah%20hitung%20di%20portal%20klien%20dan%20ingin%20konsultasi%20otomasi." target="_blank" rel="noopener noreferrer" class="portal-btn-primary" style="display:inline-flex; width:auto; padding:10px 20px;">
              <span>Konsultasi Eksekusi via WhatsApp &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(portalContainer);

  // Setup event listeners
  const backdrop = portalContainer.querySelector('#portal-backdrop');
  const closeBtn = portalContainer.querySelector('#portal-close-btn');
  const logoutBtn = portalContainer.querySelector('#portal-logout-btn');

  backdrop.addEventListener('click', closeClientPortal);
  closeBtn.addEventListener('click', closeClientPortal);
  logoutBtn?.addEventListener('click', async () => {
    if (confirm('Keluar dari sesi akun Anda?')) {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      window.location.reload();
    }
  });

  // Tab switching
  const tabs = portalContainer.querySelectorAll('.portal-tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      btn.classList.add('is-active');

      const targetTab = btn.getAttribute('data-tab');
      portalContainer.querySelectorAll('.portal-pane').forEach((p) => p.classList.remove('is-active'));
      portalContainer.querySelector(`#pane-${targetTab}`)?.classList.add('is-active');
    });
  });

  // Project brief submission form
  const briefForm = portalContainer.querySelector('#portal-brief-form');
  briefForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = portalContainer.querySelector('#brief-category').value;
    const desc = portalContainer.querySelector('#brief-description').value;
    const timeline = portalContainer.querySelector('#brief-timeline').value;

    const submitBtn = portalContainer.querySelector('#brief-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Mengirim brief...';

    try {
      const res = await fetch('/api/auth/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceCategory: category,
          description: desc,
          targetTimeline: timeline
        })
      });

      if (res.ok) {
        portalContainer.querySelector('#portal-brief-success').style.display = 'block';
        briefForm.reset();
      } else {
        alert('Gagal mengirim brief. Pastikan Anda sudah login.');
      }
    } catch (_) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Kirimkan Brief ke Tim Manuver &rarr;';
    }
  });

  window.openClientPortal = openClientPortal;
  window.closeClientPortal = closeClientPortal;
}

export async function openClientPortal() {
  initClientPortal();

  const backdrop = document.getElementById('portal-backdrop');
  const modal = document.getElementById('portal-modal');

  // Fetch dashboard data
  try {
    const res = await fetch('/api/auth/dashboard', { credentials: 'include' });
    if (res.ok) {
      currentDashboardData = await res.json();
      renderDashboardData(currentDashboardData);
    }
  } catch (_) {}

  backdrop?.classList.add('is-open');
  modal?.classList.add('is-open');
}

export function closeClientPortal() {
  document.getElementById('portal-backdrop')?.classList.remove('is-open');
  document.getElementById('portal-modal')?.classList.remove('is-open');
}

function renderDashboardData(data) {
  if (!data || !data.user) return;

  const avatarEl = document.getElementById('portal-avatar');
  const nameEl = document.getElementById('portal-user-name');
  const emailEl = document.getElementById('portal-user-email');

  if (avatarEl && data.user.avatar_url) avatarEl.src = data.user.avatar_url;
  if (nameEl) nameEl.innerHTML = `${data.user.name || 'Client'} <span class="portal-badge-pro">Active Client</span>`;
  if (emailEl) emailEl.textContent = data.user.email || '';

  // Render projects
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    const listEl = document.getElementById('portal-projects-list');
    if (listEl) {
      listEl.innerHTML = data.projects
        .map((p) => {
          const statusClass = p.status === 'completed' ? 'completed' : p.status === 'development' ? 'dev' : 'discovery';
          const statusLabel = p.status === 'completed' ? 'Selesai & Garansi' : p.status === 'development' ? 'Fase 3: Fast Build' : 'Fase 1: Discovery';
          return `
            <div class="portal-card">
              <div class="portal-card-head">
                <h4 class="portal-card-title">${p.title}</h4>
                <span class="portal-status-pill portal-status-pill--${statusClass}">${statusLabel}</span>
              </div>
              <p style="font-size:13.5px; color:rgba(244,243,240,0.65); margin:0 0 8px;">
                ${p.notes || 'Project sedang dalam pemantauan tim akselerasi Manuver.'}
              </p>
              <div class="portal-progress-bar-wrap">
                <div class="portal-progress-bar-fill" style="width: ${p.progress_percent || 25}%;"></div>
              </div>
              <div class="portal-timeline">
                <div class="portal-timeline-step ${p.progress_percent >= 25 ? 'is-passed' : ''}">
                  <div class="portal-timeline-step-num">01</div>
                  <div class="portal-timeline-step-label">Discovery</div>
                </div>
                <div class="portal-timeline-step ${p.progress_percent >= 50 ? 'is-passed' : ''}">
                  <div class="portal-timeline-step-num">02</div>
                  <div class="portal-timeline-step-label">Arsitektur</div>
                </div>
                <div class="portal-timeline-step ${p.progress_percent >= 75 ? 'is-passed' : ''}">
                  <div class="portal-timeline-step-num">03</div>
                  <div class="portal-timeline-step-label">Fast Build</div>
                </div>
                <div class="portal-timeline-step ${p.progress_percent >= 100 ? 'is-passed' : ''}">
                  <div class="portal-timeline-step-num">04</div>
                  <div class="portal-timeline-step-label">Garansi 30 Hari</div>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }
  }

  // Render ROI if saved
  if (data.latestRoi) {
    const m = document.getElementById('portal-roi-monthly');
    const a = document.getElementById('portal-roi-annual');
    if (m) m.textContent = `~${data.latestRoi.monthly_saved_hours} Jam`;
    if (a) a.textContent = `~${data.latestRoi.annual_saved_hours} Jam`;
  }
}
