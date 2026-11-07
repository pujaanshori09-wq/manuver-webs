/**
 * ============================================================
 * Manuver Landing Page - Interactive High-Converting Sections
 * ============================================================
 */

import './LandingSections.css';
import { t, getCurrentLanguage, onLanguageChange } from './i18n.js';
import { WHATSAPP_NUMBER } from '../api/knowledge.js';

export function initLandingSections(containerSelector = '#landing-sections') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  let lang = getCurrentLanguage();
  let activeTab = 'automation';
  let hoursPerWeek = 15;
  let teamSize = 3;

  function render() {
    container.innerHTML = `
      <!-- ============================================================
           1. Interactive Core Services Tabs
           ============================================================ -->
      <section id="services" class="landing-section">
        <div class="layout-wrapper">
          <div class="section-head">
            <span class="section-badge"><i></i><span data-i18n="landing.services.badge">${t('landing.services.badge', lang)}</span></span>
            <h2 class="section-title" data-i18n="landing.services.title">${t('landing.services.title', lang)}</h2>
            <p class="section-subtitle" data-i18n="landing.services.subtitle">${t('landing.services.subtitle', lang)}</p>
          </div>

          <div class="services-tabs-container">
            <nav class="services-nav" role="tablist" aria-label="Services selection">
              <button type="button" class="services-tab-btn ${activeTab === 'automation' ? 'active' : ''}" data-tab="automation" role="tab" aria-selected="${activeTab === 'automation'}">
                ${t('landing.services.tabAutomation', lang)}
              </button>
              <button type="button" class="services-tab-btn ${activeTab === 'web' ? 'active' : ''}" data-tab="web" role="tab" aria-selected="${activeTab === 'web'}">
                ${t('landing.services.tabWeb', lang)}
              </button>
              <button type="button" class="services-tab-btn ${activeTab === 'ai' ? 'active' : ''}" data-tab="ai" role="tab" aria-selected="${activeTab === 'ai'}">
                ${t('landing.services.tabAi', lang)}
              </button>
            </nav>

            <div class="services-card" id="services-card-content">
              ${renderTabContent(activeTab)}
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           2. Interactive Time-Saved / ROI Calculator
           ============================================================ -->
      <section id="calculator" class="landing-section">
        <div class="layout-wrapper">
          <div class="section-head">
            <span class="section-badge"><i></i><span>${t('landing.calculator.badge', lang)}</span></span>
            <h2 class="section-title">${t('landing.calculator.title', lang)}</h2>
            <p class="section-subtitle">${t('landing.calculator.subtitle', lang)}</p>
          </div>

          <div class="calc-grid">
            <div class="calc-controls">
              <!-- Slider 1: Hours -->
              <div class="calc-control-group">
                <div class="calc-label-row">
                  <label for="slider-hours" class="calc-label">${t('landing.calculator.sliderHoursLabel', lang)}</label>
                  <span class="calc-val-badge" id="val-badge-hours">${hoursPerWeek} ${t('landing.calculator.hoursUnit', lang)}</span>
                </div>
                <input type="range" id="slider-hours" class="calc-slider" min="5" max="40" step="1" value="${hoursPerWeek}">
              </div>

              <!-- Slider 2: Team Size -->
              <div class="calc-control-group">
                <div class="calc-label-row">
                  <label for="slider-team" class="calc-label">${t('landing.calculator.sliderTeamLabel', lang)}</label>
                  <span class="calc-val-badge" id="val-badge-team">${teamSize} ${t('landing.calculator.peopleUnit', lang)}</span>
                </div>
                <input type="range" id="slider-team" class="calc-slider" min="1" max="15" step="1" value="${teamSize}">
              </div>

              <div class="calc-highlight-box">
                <span class="calc-highlight-title">${t('landing.calculator.efficiencyGain', lang)}</span>
                <span class="calc-highlight-val">+78% Faster</span>
              </div>
            </div>

            <!-- Results Display -->
            <div class="calc-results-box">
              <div class="calc-stats-row">
                <div class="calc-stat-item">
                  <span class="calc-stat-num" id="calc-result-monthly">${calculateMonthlyHours()}h</span>
                  <span class="calc-stat-label">${t('landing.calculator.monthlySaved', lang)}</span>
                </div>
                <div class="calc-stat-item">
                  <span class="calc-stat-num" id="calc-result-annual">${calculateAnnualHours()}h</span>
                  <span class="calc-stat-label">${t('landing.calculator.annualSaved', lang)}</span>
                </div>
              </div>

              <button type="button" class="calc-cta-btn" id="calc-whatsapp-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>${t('landing.calculator.ctaBtn', lang)}</span>
              </button>

              <span class="calc-disclaimer">${t('landing.calculator.disclaimer', lang)}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           3. 4-Step Process Section
           ============================================================ -->
      <section id="process" class="landing-section">
        <div class="layout-wrapper">
          <div class="section-head center">
            <span class="section-badge"><i></i><span>${t('landing.process.badge', lang)}</span></span>
            <h2 class="section-title">${t('landing.process.title', lang)}</h2>
            <p class="section-subtitle">${t('landing.process.subtitle', lang)}</p>
          </div>

          <div class="process-grid">
            <div class="process-card">
              <span class="process-step-num">${t('landing.process.step1Num', lang)}</span>
              <h3 class="process-step-title">${t('landing.process.step1Title', lang)}</h3>
              <p class="process-step-desc">${t('landing.process.step1Desc', lang)}</p>
            </div>
            <div class="process-card">
              <span class="process-step-num">${t('landing.process.step2Num', lang)}</span>
              <h3 class="process-step-title">${t('landing.process.step2Title', lang)}</h3>
              <p class="process-step-desc">${t('landing.process.step2Desc', lang)}</p>
            </div>
            <div class="process-card">
              <span class="process-step-num">${t('landing.process.step3Num', lang)}</span>
              <h3 class="process-step-title">${t('landing.process.step3Title', lang)}</h3>
              <p class="process-step-desc">${t('landing.process.step3Desc', lang)}</p>
            </div>
            <div class="process-card">
              <span class="process-step-num">${t('landing.process.step4Num', lang)}</span>
              <h3 class="process-step-title">${t('landing.process.step4Title', lang)}</h3>
              <p class="process-step-desc">${t('landing.process.step4Desc', lang)}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           4. Interactive FAQ Accordion
           ============================================================ -->
      <section id="faq" class="landing-section">
        <div class="layout-wrapper">
          <div class="section-head center">
            <span class="section-badge"><i></i><span>${t('landing.faq.badge', lang)}</span></span>
            <h2 class="section-title">${t('landing.faq.title', lang)}</h2>
            <p class="section-subtitle">${t('landing.faq.subtitle', lang)}</p>
          </div>

          <div class="faq-accordion" role="region" aria-label="FAQ">
            <div class="faq-item">
              <button type="button" class="faq-question-btn" aria-expanded="false">
                <span>${t('landing.faq.q1', lang)}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer">
                <p>${t('landing.faq.a1', lang)}</p>
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-question-btn" aria-expanded="false">
                <span>${t('landing.faq.q2', lang)}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer">
                <p>${t('landing.faq.a2', lang)}</p>
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-question-btn" aria-expanded="false">
                <span>${t('landing.faq.q3', lang)}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer">
                <p>${t('landing.faq.a3', lang)}</p>
              </div>
            </div>

            <div class="faq-item">
              <button type="button" class="faq-question-btn" aria-expanded="false">
                <span>${t('landing.faq.q4', lang)}</span>
                <span class="faq-icon" aria-hidden="true">+</span>
              </button>
              <div class="faq-answer">
                <p>${t('landing.faq.a4', lang)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           5. Bottom High-Converting CTA Banner
           ============================================================ -->
      <section id="contact" class="landing-section">
        <div class="layout-wrapper">
          <div class="bottom-cta-banner">
            <span class="section-badge"><i></i><span>${t('landing.bottomCta.badge', lang)}</span></span>
            <h2 class="bottom-cta-title">${t('landing.bottomCta.title', lang)}</h2>
            <p class="bottom-cta-subtitle">${t('landing.bottomCta.subtitle', lang)}</p>
            <button type="button" class="bottom-cta-btn" id="bottom-cta-consult-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${t('landing.bottomCta.btnWhatsApp', lang)}</span>
            </button>
            <span class="bottom-cta-guarantee">${t('landing.bottomCta.guarantee', lang)}</span>
          </div>
        </div>
      </section>
    `;

    attachEvents();
  }

  function renderTabContent(tab) {
    if (tab === 'automation') {
      const points = t('landing.services.automationPoints', lang) || [];
      return `
        <div class="services-card-info">
          <h3 class="services-card-title">${t('landing.services.automationTitle', lang)}</h3>
          <p class="services-card-desc">${t('landing.services.automationDesc', lang)}</p>
          <ul class="services-card-points">
            ${points.map((pt) => `
              <li>
                <span class="services-point-icon">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2.5 6l2.5 2.5 4.5-5"/></svg>
                </span>
                <span>${pt}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="services-card-visual" aria-hidden="true">
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span>Customer Form / Sheet Order</span>
          </div>
          <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span>Manuver Automated Webhook Logic</span>
          </div>
          <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>Instant WhatsApp Notification & DB Sync</span>
          </div>
        </div>
      `;
    }

    if (tab === 'web') {
      const points = t('landing.services.webPoints', lang) || [];
      return `
        <div class="services-card-info">
          <h3 class="services-card-title">${t('landing.services.webTitle', lang)}</h3>
          <p class="services-card-desc">${t('landing.services.webDesc', lang)}</p>
          <ul class="services-card-points">
            ${points.map((pt) => `
              <li>
                <span class="services-point-icon">
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2.5 6l2.5 2.5 4.5-5"/></svg>
                </span>
                <span>${pt}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="services-card-visual" aria-hidden="true">
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            <span>Sub-second Next-Gen Architecture</span>
          </div>
          <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>High-Converting Sleek Responsive UI</span>
          </div>
          <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
          <div class="visual-flow-node">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Live Serverless Cloud Deployment</span>
          </div>
        </div>
      `;
    }

    // Default 'ai' tab
    const points = t('landing.services.aiPoints', lang) || [];
    return `
      <div class="services-card-info">
        <h3 class="services-card-title">${t('landing.services.aiTitle', lang)}</h3>
        <p class="services-card-desc">${t('landing.services.aiDesc', lang)}</p>
        <ul class="services-card-points">
          ${points.map((pt) => `
            <li>
              <span class="services-point-icon">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor"><path d="M2.5 6l2.5 2.5 4.5-5"/></svg>
              </span>
              <span>${pt}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="services-card-visual" aria-hidden="true">
        <div class="visual-flow-node">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Visitor Inquiries & Lead Intake</span>
        </div>
        <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
        <div class="visual-flow-node">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span>Trained Business Knowledge & RAG</span>
        </div>
        <div class="visual-flow-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg></div>
        <div class="visual-flow-node">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Automated Document & Needs Summary</span>
        </div>
      </div>
    `;
  }

  function calculateMonthlyHours() {
    // 78% average automation savings
    return Math.round(hoursPerWeek * teamSize * 4.33 * 0.78);
  }

  function calculateAnnualHours() {
    return Math.round(calculateMonthlyHours() * 12);
  }

  function getCalculatorWhatsAppUrl() {
    const hours = calculateMonthlyHours();
    const text = lang === 'id'
      ? `Halo Manuver, saya telah menghitung estimasi waktu manual tim saya (~${hours} jam/bulan). Saya ingin konsultasi solusi otomasi untuk bisnis saya.`
      : `Hi Manuver, I calculated our team manual overhead (~${hours} hrs/month). I'd like to consult on an automation solution for our business.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  function attachEvents() {
    // 1. Services Tabs Click
    const tabButtons = container.querySelectorAll('.services-tab-btn');
    const contentCard = container.querySelector('#services-card-content');
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        if (!target || target === activeTab) return;
        activeTab = target;

        tabButtons.forEach((b) => {
          const isAct = b.getAttribute('data-tab') === activeTab;
          b.classList.toggle('active', isAct);
          b.setAttribute('aria-selected', isAct);
        });

        if (contentCard) {
          contentCard.style.opacity = '0';
          contentCard.style.transform = 'translateY(6px)';
          setTimeout(() => {
            contentCard.innerHTML = renderTabContent(activeTab);
            contentCard.style.opacity = '1';
            contentCard.style.transform = 'translateY(0)';
          }, 150);
        }
      });
    });

    // 2. Calculator Sliders
    const sliderHours = container.querySelector('#slider-hours');
    const sliderTeam = container.querySelector('#slider-team');
    const badgeHours = container.querySelector('#val-badge-hours');
    const badgeTeam = container.querySelector('#val-badge-team');
    const resMonthly = container.querySelector('#calc-result-monthly');
    const resAnnual = container.querySelector('#calc-result-annual');
    const ctaBtn = container.querySelector('#calc-whatsapp-btn');

    function updateCalc() {
      if (sliderHours) hoursPerWeek = parseInt(sliderHours.value, 10) || 15;
      if (sliderTeam) teamSize = parseInt(sliderTeam.value, 10) || 3;

      if (badgeHours) badgeHours.textContent = `${hoursPerWeek} ${t('landing.calculator.hoursUnit', lang)}`;
      if (badgeTeam) badgeTeam.textContent = `${teamSize} ${t('landing.calculator.peopleUnit', lang)}`;

      const monthly = calculateMonthlyHours();
      const annual = calculateAnnualHours();

      if (resMonthly) resMonthly.textContent = `${monthly}h`;
      if (resAnnual) resAnnual.textContent = `${annual}h`;
    }

    if (sliderHours) sliderHours.addEventListener('input', updateCalc);
    if (sliderTeam) sliderTeam.addEventListener('input', updateCalc);

    // Calculator CTA: Trigger consultative AI discovery interview
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const hours = calculateMonthlyHours();
        const prompt = lang === 'id'
          ? `Halo! Saya baru saja menghitung potensi hemat ~${hours} jam kerja per bulan di kalkulator. Boleh bantu riset & konsultasikan solusi otomasi yang cocok untuk bisnis saya?`
          : `Hi! I just calculated potential savings of ~${hours} hrs/month on the calculator. Could you help research and consult on the best automation solution for my business?`;
        if (window.openManuverChat) {
          window.openManuverChat(prompt);
        }
      });
    }

    // Bottom Banner CTA: Trigger consultative AI discovery interview
    const bottomCtaBtn = container.querySelector('#bottom-cta-consult-btn');
    if (bottomCtaBtn) {
      bottomCtaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const prompt = lang === 'id'
          ? 'Halo! Saya ingin konsultasi ide teknologi & aplikasi untuk bisnis saya. Apa saja yang perlu saya siapkan?'
          : 'Hi! I would like to consult on an app or tech project for my business. What should we start with?';
        if (window.openManuverChat) {
          window.openManuverChat(prompt);
        }
      });
    }

    // 3. FAQ Accordion Click
    const faqItems = container.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const qBtn = item.querySelector('.faq-question-btn');
      if (!qBtn) return;
      qBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close other FAQ items
        faqItems.forEach((other) => {
          if (other !== item) {
            other.classList.remove('is-open');
            const otherBtn = other.querySelector('.faq-question-btn');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current
        item.classList.toggle('is-open', !isOpen);
        qBtn.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  // Subscribe to language change event
  onLanguageChange((newLang) => {
    lang = newLang;
    render();
  });

  // Initial render
  render();
}
