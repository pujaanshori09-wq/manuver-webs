/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './dashboard.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--bg-base)',
        'sidebar-top': 'var(--sidebar-top)',
        'sidebar-bottom': 'var(--sidebar-bottom)',
        panel: 'var(--panel)',
        'panel-hover': 'var(--panel-hover)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        accent: 'var(--accent)',
        'glow-warm': 'var(--glow-warm)',
      },
      fontFamily: {
        heading: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

