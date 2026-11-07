/**
 * ============================================================
 * i18n Translation Dictionary and State Management
 * Supports English (en) and Indonesian (id)
 * ============================================================
 */

export const dictionary = {
  en: {
    meta: {
      title: 'Manuver',
      desc: 'Manual work slows teams down. Manuver automates the repetitive parts so you can build and move first.'
    },
    nav: {
      logoAria: 'Manuver home',
      langLabel: 'Language selection',
      signIn: 'Sign in',
      getStarted: 'Get started'
    },
    hero: {
      badge: 'The cost of moving slow',
      titleLine1: "Slow Doesn't Scale.",
      titleLine2: 'Manuver Does.',
      lede: 'Manual work slows teams down. Manuver automates the repetitive parts so you can build and move first.',
      ctaStart: 'Start building',
      ctaHow: 'See how it works',
      pain1: 'Tasks pile up',
      pain2: "Tools don't connect",
      pain3: 'Ideas wait in the queue'
    },
    marquee: {
      badge: 'Selected work',
      ariaLabel: 'Selected Projects Showcase',
      categories: {
        event_organizer: 'Event organizer',
        ai_learning: 'AI learning',
        sports_partners: 'Find sports partners',
        botanical_ritual: 'Modern Botanical Ritual',
        website_services: 'Services',
        automation_services: 'Automation'
      }
    },
    contact: {
      title: 'Contact us',
      email: 'aiomanuver@gmail.com',
      instagram: 'https://www.instagram.com/manuver.aio'
    },
    alerts: {
      supabaseConfig: 'Supabase is not configured correctly. Put your project URL and publishable key in .env.'
    },
    chat: {
      launcherAria: 'Chat with Manuver Assistant',
      title: 'Manuver',
      onlineStatus: 'Usually replies in seconds',
      restart: 'Restart',
      restartAria: 'Restart conversation',
      closeAria: 'Close chat',
      whatsappBtn: 'Continue on WhatsApp',
      whatsappFooterLink: 'Continue on WhatsApp',
      whatsappMessage: 'Hi Manuver, I would like to consult about an automation or tech project.',
      greeting: "Hey there! 👋 I'm Manuver's assistant. Got an idea you want to automate or build? Tell me what you have in mind.",
      suggestions: [
        'What can you build?',
        'How does it work?',
        'I need a quote'
      ],
      placeholder: 'Type your question…',
      sendAria: 'Send message',
      privacyNotice: 'Processed by AI. Do not share sensitive data.',
      typing: 'Manuver is typing...',
      charCount: 'chars',
      rateLimitAlert: 'Message limit reached (15 msgs/10 mins). You can chat directly via WhatsApp.',
      errorBusy: 'Sorry, the assistant is currently busy. You can chat directly via WhatsApp.',
      retryBtn: 'Try again'
    }
  },
  id: {
    meta: {
      title: 'Manuver',
      desc: 'Pekerjaan manual memperlambat tim. Manuver mengotomatiskan bagian yang berulang supaya kamu bisa membangun dan bergerak lebih dulu.'
    },
    nav: {
      logoAria: 'Beranda Manuver',
      langLabel: 'Pilihan bahasa',
      signIn: 'Masuk',
      getStarted: 'Mulai'
    },
    hero: {
      badge: 'Biaya bergerak lambat',
      titleLine1: 'Lambat Tak Bisa Scale.',
      titleLine2: 'Manuver Bisa.',
      lede: 'Pekerjaan manual memperlambat tim. Manuver mengotomatiskan bagian yang berulang supaya kamu bisa membangun dan bergerak lebih dulu.',
      ctaStart: 'Mulai membangun',
      ctaHow: 'Lihat cara kerjanya',
      pain1: 'Tugas menumpuk',
      pain2: 'Tool tidak saling terhubung',
      pain3: 'Ide menunggu dalam antrean'
    },
    marquee: {
      badge: 'Project pilihan',
      ariaLabel: 'Pameran Project Pilihan',
      categories: {
        event_organizer: 'Event organizer',
        ai_learning: 'Pembelajaran AI',
        sports_partners: 'Cari teman olahraga',
        botanical_ritual: 'Modern Botanical Ritual',
        website_services: 'Layanan',
        automation_services: 'Layanan'
      }
    },
    contact: {
      title: 'Hubungi kami',
      email: 'aiomanuver@gmail.com',
      instagram: 'https://www.instagram.com/manuver.aio'
    },
    alerts: {
      supabaseConfig: 'Supabase belum dikonfigurasi dengan benar. Masukkan project URL dan publishable key di .env.'
    },
    chat: {
      launcherAria: 'Chat dengan Manuver Assistant',
      title: 'Manuver',
      onlineStatus: 'Biasanya membalas dalam hitungan detik',
      restart: 'Mulai ulang',
      restartAria: 'Mulai ulang percakapan',
      closeAria: 'Tutup chat',
      whatsappBtn: 'Lanjut di WhatsApp',
      whatsappFooterLink: 'Lanjut di WhatsApp',
      whatsappMessage: 'Halo Manuver, saya ingin konsultasi mengenai project otomasi atau teknologi.',
      greeting: 'Hai! Aku asisten Manuver. Lagi ada ide yang mau diotomasi atau dibangun? Ceritakan saja, nanti kubantu.',
      suggestions: [
        'Bisa bikin apa saja?',
        'Alurnya gimana?',
        'Minta penawaran'
      ],
      placeholder: 'Tulis pertanyaanmu…',
      sendAria: 'Kirim pesan',
      privacyNotice: 'Diproses oleh AI. Jangan kirim data sensitif.',
      typing: 'Manuver sedang mengetik...',
      charCount: 'karakter',
      rateLimitAlert: 'Batas pesan tercapai (15 pesan/10 menit). Kamu bisa langsung chat lewat WhatsApp.',
      errorBusy: 'Maaf, asisten sedang sibuk. Kamu bisa langsung chat lewat WhatsApp.',
      retryBtn: 'Coba lagi'
    }
  }
};

const STORAGE_KEY = 'manuver_lang';
let currentLang = 'en';
const listeners = new Set();

/**
 * Safe localStorage reader with try/catch fallback
 */
export function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
  } catch (err) {
    console.warn('[i18n] Storage access error:', err);
  }
  return 'en';
}

/**
 * Safe localStorage writer with try/catch fallback
 */
export function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (err) {
    console.warn('[i18n] Storage save error:', err);
  }
}

/**
 * Returns current language code ('en' | 'id')
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Subscribe to language change events
 */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Retrieve nested translation string by dot-notation path, e.g. 'hero.titleLine1'
 */
export function t(path, lang = currentLang) {
  const keys = path.split('.');
  let result = dictionary[lang] || dictionary.en;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return path; // Fallback to key
    }
  }
  return result;
}

/**
 * Updates all DOM elements marked with data-i18n attributes
 */
export function updateDOM(lang = currentLang) {
  // Update document language attribute
  document.documentElement.setAttribute('lang', lang);

  // Update elements with data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    const val = t(key, lang);
    if (typeof val === 'string') {
      const textSpan = el.querySelector('[data-i18n-text]');
      if (textSpan) {
        textSpan.textContent = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // Update elements with data-i18n-aria
  const ariaElements = document.querySelectorAll('[data-i18n-aria]');
  ariaElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (!key) return;
    const val = t(key, lang);
    if (typeof val === 'string') {
      el.setAttribute('aria-label', val);
    }
  });

  // Update language toggle buttons visual state
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    const btnLang = btn.getAttribute('data-lang');
    const isActive = btnLang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * Set active language without page reload
 */
export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'id') return;
  currentLang = lang;
  saveLanguage(lang);
  updateDOM(lang);
  listeners.forEach((fn) => fn(lang));
}

/**
 * Initialize i18n system
 */
export function initI18n() {
  currentLang = getSavedLanguage();
  updateDOM(currentLang);

  // Attach click listener for language toggle buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== currentLang) {
        setLanguage(targetLang);
      }
    });
  });

  return currentLang;
}
