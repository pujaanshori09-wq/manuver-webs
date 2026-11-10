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
      greeting: "Hi there! I'm Manuver, ready to streamline your operations and save your valuable time 👋 Got an app idea or a repetitive workflow to automate? Let's talk.",
      suggestions: [
        'Consult on app idea',
        'Workflow automation',
        'What can you build?'
      ],
      placeholder: 'Type your question…',
      sendAria: 'Send message',
      privacyNotice: 'Processed by AI. Do not share sensitive data.',
      typing: 'Manuver is typing...',
      charCount: 'chars',
      rateLimitAlert: 'Message limit reached (15 msgs/10 mins). You can chat directly via WhatsApp.',
      errorBusy: 'Sorry, the assistant is currently busy. You can chat directly via WhatsApp.',
      retryBtn: 'Try again'
    },
    landing: {
      services: {
        badge: 'Core capabilities',
        title: 'Built to replace slow manual friction.',
        subtitle: 'From automated pipelines to custom digital platforms, Manuver delivers modern engineering designed for real business acceleration.',
        tabAutomation: 'Workflow Automation',
        tabWeb: 'Web & Web Apps',
        tabAi: 'Custom AI Solutions',
        automationTitle: 'Automate repetitive operations 24/7',
        automationDesc: 'Connect spreadsheets, CRMs, WhatsApp notifications, form submissions, and external APIs so your business runs smoothly without manual data entry or human error.',
        automationPoints: [
          'Eliminates manual copy-pasting between tools',
          'Instant auto-alerts & customer order confirmations',
          'Scales effortlessly with zero incremental headcount'
        ],
        webTitle: 'Modern, high-converting digital web apps',
        webDesc: 'High-speed landing pages, sleek interactive client portals, and resilient SaaS dashboards built with next-gen frameworks for maximum conversion.',
        webPoints: [
          'Sub-second page load speeds & SEO optimization',
          'Futuristic, clean responsive aesthetics across devices',
          'Scalable backend with robust database architecture'
        ],
        aiTitle: 'Custom AI assistants & intelligent agents',
        aiDesc: 'Deploy specialized conversational bots trained on your actual business data, automate document parsing, and embed LLM intelligence straight into your daily workflow.',
        aiPoints: [
          'Interactive 24/7 client discovery & lead qualification',
          'Automated data extraction & inquiry triage',
          'Private, secure API integration without third-party leaks'
        ]
      },
      calculator: {
        badge: 'Interactive ROI estimator',
        title: 'How much time is manual work costing you?',
        subtitle: 'Drag the sliders below to estimate the annual hours and operational overhead you can recover by automating with Manuver.',
        sliderHoursLabel: 'Manual repetitive hours per person / week',
        sliderTeamLabel: 'Team members involved',
        hoursUnit: 'hrs/wk',
        peopleUnit: 'people',
        monthlySaved: 'Hours saved monthly',
        annualSaved: 'Hours saved annually',
        efficiencyGain: 'Estimated efficiency gain',
        ctaBtn: 'Automate this workflow on WhatsApp →',
        disclaimer: '*Based on standard 70-85% reduction in repetitive data handling and operational tasks.'
      },
      process: {
        badge: 'How it works',
        title: 'Transparent, structured, zero-fluff execution.',
        subtitle: 'We turn complex requirements into high-performing systems in days, not months.',
        step1Num: '01',
        step1Title: 'Discovery & Mapping',
        step1Desc: 'We dissect your current bottlenecks, tools, and objectives to define the leanest, highest-impact technical blueprint.',
        step2Num: '02',
        step2Title: 'Architecture & UX',
        step2Desc: 'We design the interactive user experience and map out API data contracts before writing a single line of production code.',
        step3Num: '03',
        step3Title: 'Rapid Engineering',
        step3Desc: 'We build your solution using high-velocity modern stacks, with strict performance checks and end-to-end testing.',
        step4Num: '04',
        step4Title: 'Launch & 30-Day Warranty',
        step4Desc: 'Seamless deployment, complete handover with video tutorials for your team, backed by a 30-day bug-free warranty.'
      },
      faq: {
        badge: 'Frequently asked questions',
        title: 'Everything you need to know.',
        subtitle: 'Common questions about working with Manuver, our timelines, and technology standards.',
        q1: 'How long does a typical project take?',
        a1: 'Workflow automations typically take 3 to 7 business days. Custom landing pages and company profiles take 1 to 2 weeks. Full web applications or custom AI integrations usually take 2 to 4 weeks depending on the scope of MVP features.',
        q2: 'Is the system difficult for my team to manage?',
        a2: 'Not at all. We specifically engineer systems to be intuitive and self-operating. Every handover includes concise video documentation, clear administrative controls, and 30 days of direct support to ensure your team is 100% confident.',
        q3: 'How is data security and privacy handled?',
        a3: 'Security is a top priority. All integrations utilize official encrypted API endpoints, environment variable secrets, and private credentials. We never expose your business data or train public AI models on your proprietary information.',
        q4: 'What is required to get started?',
        a4: 'Just reach out via WhatsApp with a brief description of your current challenge or app idea. We will schedule a quick consultative discovery call and provide a clear, modular roadmap with transparent pricing.'
      },
      bottomCta: {
        badge: 'Ready to accelerate?',
        title: 'Stop moving slow. Let’s build something extraordinary.',
        subtitle: 'Tell us about your app concept or manual bottleneck. We will design the leanest, fastest digital solution for your business.',
        btnWhatsApp: 'Consult Your Project on WhatsApp →',
        guarantee: 'Free initial consultation · Transparent modular scope · 30-day bug warranty'
      }
    },
    dashboard: {
      metaTitle: 'Dashboard · Manuver',
      logoAria: 'Manuver Dashboard',
      signOut: 'Sign out',
      signOutAria: 'Sign out of your account',
      loading: 'Loading workspace...',
      
      // Sidebar Navigation
      navOverview: 'Overview',
      navRequests: 'My Requests',
      navProjects: 'My Projects',
      navProducts: 'Products',
      navHelp: 'Help & Support',
      badgeComingSoon: 'Soon',
      badgeActive: 'Active',
      
      // Top Header Context Titles
      headerOverview: 'Overview',
      headerRequests: 'My Requests',
      headerProjects: 'My Projects',
      headerProducts: 'Products & Solutions',
      headerHelp: 'Help & Support',
      
      // Welcome Section
      welcomeTitle: 'Welcome back, {name}',
      welcomeSubtitle: 'Your digital product workspace starts here.',
      welcomeQuestion: 'How can we help you build today?',
      btnCreateRequest: 'Create Request',
      
      // Main Action Card
      actionCardTitle: 'Have an idea or operational challenge to solve?',
      actionCardDesc: 'Tell us what you need. Manuver will engineer it into a scalable digital solution.',
      btnStartConsultation: 'Start Consultation',

      // Quick Solution Cards (Reference 3-Card Grid)
      quickAutomationTitle: 'Workflow Automation',
      quickAutomationDesc: 'Connect CRMs, WhatsApp, APIs, & Sheets without manual friction.',
      quickWebTitle: 'Web Apps & SaaS',
      quickWebDesc: 'Custom high-speed digital platforms, client portals, and web software.',
      quickAiTitle: 'Custom AI Solutions',
      quickAiDesc: 'Intelligent bots and private workflow pipelines trained on your data.',

      // Consultation Dock
      dockPlaceholder: 'Initiate a project brief or describe operational bottlenecks...',
      dockPillCategory: 'Categories',
      dockPillTimeline: 'Timeline',

      // Right Activity Panel
      panelActivityTitle: 'Request Activity',
      searchPlaceholder: 'Search requests...',
      emptyActivityText: 'No requests submitted yet.',
      btnCreateNewRequest: 'Create New Request',
      
      // Section Headers
      sectionProjectsTitle: 'My Projects',
      sectionProjectsDesc: 'Track active builds, architecture phases, and software deployments.',
      sectionRequestsTitle: 'My Requests',
      sectionRequestsDesc: 'Live status of your submitted project briefs and feature inquiries.',
      
      // Empty States (Strictly 1 line muted text + 1 action)
      emptyProjectsTitle: 'No active projects yet.',
      emptyProjectsDesc: '',
      emptyProjectsText: 'No active projects yet.',
      btnShareIdea: 'Start Project',
      
      emptyRequestsTitle: 'No requests submitted yet.',
      emptyRequestsDesc: '',
      emptyRequestsText: 'No requests submitted yet.',
      btnSubmitFirstRequest: 'Create Request',
      
      // Status Badges
      statusReceived: 'Received',
      statusUnderReview: 'Under Review',
      statusInDiscussion: 'In Discussion',
      statusInProgress: 'In Progress',
      statusCompleted: 'Completed',
      
      // Request Modal Form
      modalTitle: 'Create New Request',
      modalSubtitle: 'Share your vision or operational friction. Our engineering team will review it within 24 hours.',
      labelCategory: 'Solution Category',
      categoryAutomation: 'Workflow Automation (CRMs, APIs, WhatsApp, Sheets)',
      categoryWeb: 'Web Application / Modern SaaS Platform',
      categoryAi: 'Custom AI Assistant / Intelligent Workflow',
      categoryComprehensive: 'End-to-End System (Web + Automation + AI)',
      categoryOther: 'Other (Custom / Unique Requirements)',
      labelDesc: 'Describe your requirements or bottleneck',
      descPlaceholder: 'E.g., We need an automated order intake pipeline connecting Shopify to our internal ERP and instant customer updates...',
      labelTimeline: 'Target Timeline',
      timelineUrgent: 'Urgent (3–7 Days)',
      timelineStandard: 'Standard (1–2 Weeks)',
      timelineFlexible: 'Flexible (2–4 Weeks)',
      labelBudget: 'Budget Range (Optional)',
      budgetFlexible: 'Flexible / To be discussed',
      budgetTier1: '< IDR 10 Million',
      budgetTier2: 'IDR 10M – 30M',
      budgetTier3: '> IDR 30 Million',
      btnCancel: 'Cancel',
      btnSubmitRequest: 'Submit Request',
      btnSubmitting: 'Submitting...',
      toastSuccess: 'Request submitted successfully! Our team will follow up promptly.',
      toastError: 'Failed to submit request. Please try again.',
      
      // Products View
      productsHeading: 'Manuver Modular Solutions',
      productsSubheading: 'Built on our core principles: Build, Automate, and Distribute.',
      productBuildTitle: 'BUILD',
      productBuildDesc: 'Custom software applications, modern high-conversion web platforms, and resilient system architectures.',
      productAutomateTitle: 'AUTOMATE',
      productAutomateDesc: '24/7 autonomous data pipelines, cross-tool webhooks, and automated operational task routing.',
      productDistributeTitle: 'DISTRIBUTE',
      productDistributeDesc: 'License management, multi-tenant digital SaaS configurations, and secure commercial deployment.',
      productAvailableBadge: 'Available via Consultation',
      
      // Help View
      helpHeading: 'Help & Direct Support',
      helpSubheading: 'Need assistance or have an urgent technical question? Connect directly with the Manuver team.',
      helpWhatsAppTitle: 'Direct WhatsApp Consultation',
      helpWhatsAppDesc: 'Chat directly with our lead technical architect in real-time.',
      btnOpenWhatsApp: 'Chat on WhatsApp →',
      helpEmailTitle: 'Email Support',
      helpEmailDesc: 'Send detailed technical specs, RFPs, or security questionnaires.',
      btnEmailSupport: 'Send Email →'
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
      greeting: 'Halo kak! Saya Manuver, siap membantu mengefisiensikan waktu dan operasional bisnis kamu 👋 Ada ide aplikasi atau alur kerja yang mau dibuat otomatis nih?',
      suggestions: [
        'Konsultasi ide aplikasi',
        'Otomasi alur kerja',
        'Bisa bikin apa saja?'
      ],
      placeholder: 'Tulis pertanyaanmu…',
      sendAria: 'Kirim pesan',
      privacyNotice: 'Diproses oleh AI. Jangan kirim data sensitif.',
      typing: 'Manuver sedang mengetik...',
      charCount: 'karakter',
      rateLimitAlert: 'Batas pesan tercapai (15 pesan/10 menit). Kamu bisa langsung chat lewat WhatsApp.',
      errorBusy: 'Maaf, asisten sedang sibuk. Kamu bisa langsung chat lewat WhatsApp.',
      retryBtn: 'Coba lagi'
    },
    landing: {
      services: {
        badge: 'Layanan Utama',
        title: 'Dirancang untuk mengeliminasi pekerjaan lambat.',
        subtitle: 'Dari otomatisasi sistem hingga platform digital modern, Manuver menghadirkan teknologi mutakhir untuk mempercepat pertumbuhan bisnis Anda.',
        tabAutomation: 'Otomasi Alur Kerja',
        tabWeb: 'Web & Web App',
        tabAi: 'Solusi AI Kustom',
        automationTitle: 'Operasional berjalan otomatis 24/7 tanpa henti',
        automationDesc: 'Hubungkan Google Sheets, CRM, WhatsApp Bot, formulir pemesanan, dan API pihak ketiga agar operasional bisnis Anda berjalan otomatis tanpa salah ketik atau entri manual.',
        automationPoints: [
          'Menghilangkan kebiasaan copy-paste manual antar aplikasi',
          'Notifikasi & konfirmasi pesanan otomatis instan ke pelanggan',
          'Operasional mudah di-scale up tanpa perlu tambah karyawan'
        ],
        webTitle: 'Website & aplikasi modern berkonversi tinggi',
        webDesc: 'Landing page berkecepatan tinggi, portal klien interaktif yang elegan, dan dashboard SaaS modern yang dirancang untuk memaksimalkan penjualan dan leads.',
        webPoints: [
          'Kecepatan loading sub-detik & optimalisasi SEO',
          'Desain futuristik responsif yang nyaman di semua perangkat',
          'Arsitektur database yang aman, cepat, dan siap berkembang'
        ],
        aiTitle: 'Asisten AI pintar & otomatisasi data cerdas',
        aiDesc: 'Hadirkan bot interaktif yang dilatih dengan data bisnis Anda, otomatisasi pembacaan dokumen/invoice, dan integrasikan kecerdasan buatan langsung ke alur kerja harian.',
        aiPoints: [
          'Riset & kualifikasi calon klien otomatis 24 jam nonstop',
          'Ekstraksi data & ringkasan pesan masuk secara instan',
          'Jalur API privat yang aman tanpa kebocoran data rahasia'
        ]
      },
      calculator: {
        badge: 'Kalkulator ROI Interaktif',
        title: 'Berapa banyak waktu yang terbuang oleh kerja manual?',
        subtitle: 'Geser slider di bawah ini untuk melihat estimasi jam kerja operasional yang bisa Anda hemat setiap bulan dan tahun dengan otomatisasi Manuver.',
        sliderHoursLabel: 'Jam kerja manual repetitif per orang / minggu',
        sliderTeamLabel: 'Jumlah anggota tim yang terlibat',
        hoursUnit: 'jam/mgg',
        peopleUnit: 'orang',
        monthlySaved: 'Jam kerja dihemat per bulan',
        annualSaved: 'Jam kerja dihemat per tahun',
        efficiencyGain: 'Peningkatan efisiensi operasional',
        ctaBtn: 'Konsultasikan Otomasi Ini via WhatsApp →',
        disclaimer: '*Berdasarkan rata-rata efisiensi 70-85% eliminasi tugas repetitif dan entri data manual.'
      },
      process: {
        badge: 'Cara Kerja',
        title: 'Alur kerja transparan, terstruktur, & tanpa basa-basi.',
        subtitle: 'Kami mengubah ide dan kebutuhan rumit menjadi sistem yang siap pakai dalam hitungan hari, bukan berbulan-bulan.',
        step1Num: '01',
        step1Title: 'Discovery & Pemetaan Masalah',
        step1Desc: 'Kami membedah alur kerja dan kendala utama bisnis Anda untuk merumuskan arsitektur solusi yang paling efisien dan berdampak tinggi.',
        step2Num: '02',
        step2Title: 'Desain & Skema Solusi',
        step2Desc: 'Kami merancang alur antarmuka pengguna (UI/UX) dan skema integrasi data sebelum penulisan kode dimulai.',
        step3Num: '03',
        step3Title: 'Pengerjaan Cepat (Fast Build)',
        step3Desc: 'Membangun aplikasi dengan teknologi modern berkecepatan tinggi, melalui pengujian fungsional dan performa yang ketat.',
        step4Num: '04',
        step4Title: 'Peluncuran & Garansi 30 Hari',
        step4Desc: 'Serah terima sistem lengkap dengan video tutorial cara pakai untuk tim Anda, didukung garansi perbaikan bug selama 30 hari.'
      },
      faq: {
        badge: 'Pertanyaan Umum',
        title: 'Segala hal yang perlu Anda ketahui.',
        subtitle: 'Jawaban atas pertanyaan yang paling sering diajukan seputar kerja sama, timeline, dan teknologi Manuver.',
        q1: 'Berapa lama estimasi pengerjaan sebuah project?',
        a1: 'Otomasi alur kerja biasanya memakan waktu 3 hingga 7 hari kerja. Landing page dan company profile modern memakan waktu 1 hingga 2 minggu. Aplikasi web atau integrasi AI kustom umumnya memakan waktu 2 hingga 4 minggu sesuai skala fitur MVP.',
        q2: 'Apakah sistemnya sulit dioperasikan oleh tim saya?',
        a2: 'Sama sekali tidak. Kami selalu merancang sistem yang intuitif dan ramah pengguna. Setiap serah terima dilengkapi video dokumentasi langkah demi langkah serta garansi pendampingan selama 30 hari.',
        q3: 'Bagaimana dengan keamanan data bisnis kami?',
        a3: 'Keamanan data adalah prioritas utama. Semua integrasi menggunakan jalur API resmi terenkripsi dan kredensial privat. Kami tidak pernah membagikan data bisnis Anda ke pihak ketiga.',
        q4: 'Bagaimana cara memulainya?',
        a4: 'Cukup klik tombol WhatsApp dan ceritakan kebutuhan atau ide aplikasi Anda. Kami akan menjadwalkan sesi konsultasi singkat dan memberikan estimasi rencana kerja secara transparan.'
      },
      bottomCta: {
        badge: 'Siap Bergerak Cepat?',
        title: 'Hentikan kerja manual yang lambat. Wujudkan sistem modern Anda.',
        subtitle: 'Ceritakan ide aplikasi atau alur kerja yang ingin Anda bangun. Kami bantu rancang solusi teknologi yang paling efisien untuk bisnis Anda.',
        btnWhatsApp: 'Konsultasikan Project Anda di WhatsApp →',
        guarantee: 'Konsultasi awal gratis · Skema transparan · Garansi bug 30 hari'
      }
    },
    dashboard: {
      metaTitle: 'Dashboard · Manuver',
      logoAria: 'Dashboard Manuver',
      signOut: 'Keluar',
      signOutAria: 'Keluar dari akun Anda',
      loading: 'Memuat ruang kerja...',
      
      // Sidebar Navigation
      navOverview: 'Ringkasan',
      navRequests: 'Permintaan Saya',
      navProjects: 'Proyek Saya',
      navProducts: 'Produk',
      navHelp: 'Bantuan',
      badgeComingSoon: 'Segera',
      badgeActive: 'Aktif',
      
      // Top Header Context Titles
      headerOverview: 'Ringkasan',
      headerRequests: 'Permintaan Saya',
      headerProjects: 'Proyek Saya',
      headerProducts: 'Produk & Solusi',
      headerHelp: 'Bantuan & Dukungan',
      
      // Welcome Section
      welcomeTitle: 'Selamat datang kembali, {name}.',
      welcomeSubtitle: 'Ruang kerja digital Anda dimulai dari sini.',
      welcomeQuestion: 'Apa yang ingin Anda kembangkan hari ini?',
      btnCreateRequest: 'Buat Permintaan',
      
      // Main Action Card
      actionCardTitle: 'Ada ide atau kebutuhan yang ingin diwujudkan?',
      actionCardDesc: 'Ceritakan kebutuhan Anda. Manuver akan membantu mengubahnya menjadi solusi digital.',
      btnStartConsultation: 'Mulai Konsultasi',

      // Quick Solution Cards (Reference 3-Card Grid)
      quickAutomationTitle: 'Otomasi Alur Kerja',
      quickAutomationDesc: 'Hubungkan CRM, WhatsApp, API, & Sheets tanpa kerja manual.',
      quickWebTitle: 'Aplikasi Web & SaaS',
      quickWebDesc: 'Pengembangan platform digital, portal klien, dan web berkecepatan tinggi.',
      quickAiTitle: 'Solusi AI Kustom',
      quickAiDesc: 'Asisten cerdas dan integrasi AI berbasis data bisnis Anda.',

      // Consultation Dock
      dockPlaceholder: 'Konsultasikan ide proyek atau kendala manual Anda...',
      dockPillCategory: 'Pilih Kategori',
      dockPillTimeline: 'Timeline Standar',

      // Right Activity Panel
      panelActivityTitle: 'Aktivitas Permintaan',
      searchPlaceholder: 'Cari permintaan...',
      emptyActivityText: 'Belum ada riwayat permintaan.',
      btnCreateNewRequest: 'Buat Permintaan Baru',
      
      // Section Headers
      sectionProjectsTitle: 'Proyek Saya',
      sectionProjectsDesc: 'Pantau perkembangan aplikasi, fase arsitektur, dan sistem yang sedang dibangun.',
      sectionRequestsTitle: 'Permintaan Saya',
      sectionRequestsDesc: 'Status langsung dari brief proyek dan permintaan fitur yang Anda ajukan.',
      
      // Empty States (Strictly 1 line muted text + 1 action)
      emptyProjectsTitle: 'Belum ada proyek aktif.',
      emptyProjectsDesc: '',
      emptyProjectsText: 'Belum ada proyek aktif.',
      btnShareIdea: 'Mulai Proyek',
      
      emptyRequestsTitle: 'Belum ada permintaan yang diajukan.',
      emptyRequestsDesc: '',
      emptyRequestsText: 'Belum ada permintaan yang diajukan.',
      btnSubmitFirstRequest: 'Buat Permintaan',
      
      // Status Badges
      statusReceived: 'Diterima',
      statusUnderReview: 'Sedang Ditinjau',
      statusInDiscussion: 'Dalam Diskusi',
      statusInProgress: 'Sedang Dikerjakan',
      statusCompleted: 'Selesai',
      
      // Request Modal Form
      modalTitle: 'Buat Permintaan Baru',
      modalSubtitle: 'Ceritakan kendala manual atau ide produk Anda. Tim rekayasa kami akan meninjaunya dalam 24 jam.',
      labelCategory: 'Kategori Solusi',
      categoryAutomation: 'Otomasi Alur Kerja (CRM, API, WhatsApp, Sheets)',
      categoryWeb: 'Aplikasi Web / Platform SaaS Modern',
      categoryAi: 'Asisten AI Kustom / Alur Kerja Cerdas',
      categoryComprehensive: 'Sistem Terintegrasi (Web + Otomasi + AI)',
      categoryOther: 'Lainnya (Kebutuhan Khusus / Kustom)',
      labelDesc: 'Deskripsikan Kebutuhan atau Masalah Bisnis Anda',
      descPlaceholder: 'Contoh: Kami ingin menghubungkan form pesanan ke spreadsheet dan mengirim notifikasi WhatsApp otomatis ke pembeli...',
      labelTimeline: 'Target Timeline Pengerjaan',
      timelineUrgent: 'Mendesak (3–7 Hari Kerja)',
      timelineStandard: 'Standar (1–2 Minggu)',
      timelineFlexible: 'Fleksibel (2–4 Minggu)',
      labelBudget: 'Perkiraan Budget (Opsional)',
      budgetFlexible: 'Fleksibel / Diskusi lanjutan',
      budgetTier1: '< Rp 10 Juta',
      budgetTier2: 'Rp 10 Juta – 30 Juta',
      budgetTier3: '> Rp 30 Juta',
      btnCancel: 'Batal',
      btnSubmitRequest: 'Kirimkan Permintaan',
      btnSubmitting: 'Mengirim...',
      toastSuccess: 'Permintaan berhasil dikirim! Tim Manuver akan segera menghubungi Anda.',
      toastError: 'Gagal mengirim permintaan. Silakan coba kembali.',
      
      // Products View
      productsHeading: 'Solusi Modular Manuver',
      productsSubheading: 'Dibangun di atas tiga prinsip: Build, Automate, dan Distribute.',
      productBuildTitle: 'BUILD',
      productBuildDesc: 'Pengembangan aplikasi kustom, software tangguh, dan arsitektur sistem digital berperforma tinggi.',
      productAutomateTitle: 'AUTOMATE',
      productAutomateDesc: 'Solusi otomatisasi alur kerja 24/7 untuk menghilangkan friksi manual dan meningkatkan efisiensi bisnis.',
      productDistributeTitle: 'DISTRIBUTE',
      productDistributeDesc: 'Konfigurasi lisensi produk digital, arsitektur multi-tenant, dan distribusi produk secara terukur.',
      productAvailableBadge: 'Tersedia via Konsultasi',
      
      // Help View
      helpHeading: 'Bantuan & Dukungan Langsung',
      helpSubheading: 'Butuh bantuan atau ingin konsultasi teknis mendesak? Hubungi langsung tim Manuver.',
      helpWhatsAppTitle: 'Konsultasi Langsung via WhatsApp',
      helpWhatsAppDesc: 'Terhubung langsung dengan lead technical architect Manuver secara realtime.',
      btnOpenWhatsApp: 'Konsultasi di WhatsApp →',
      helpEmailTitle: 'Dukungan via Email',
      helpEmailDesc: 'Kirimkan dokumen spesifikasi teknis, NDA, atau proposal kerja sama.',
      btnEmailSupport: 'Kirim Email →'
    }
  }
};

const STORAGE_KEY = 'manuver_lang';
let currentLang = 'id';
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
  return 'id';
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
