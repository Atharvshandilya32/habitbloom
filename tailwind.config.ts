/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        card: '#ffffff',
        border: '#e2e8f0',
        muted: '#f8fafc',
        accent: '#dcfce7',
        primary: '#22c55e',
        secondary: '#bfdbfe',
        background: '#f8fafc',
        foreground: '#0f172a',
        'primary-foreground': '#ffffff',
        'muted-foreground': '#64748b',
      },
      boxShadow: {
        card: '0 20px 60px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
