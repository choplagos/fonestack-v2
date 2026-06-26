/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        premiumYellow: '#E6FF00',
        obsidian: {
          900: '#050505',
          800: '#0A0A0A',
          700: '#121212',
        },
        wa: '#25D366'
      },
      fontFamily: {
        display: ['var(--font-sora)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backdropBlur: {
        '2xl': '40px',
      }
    },
  },
  plugins: [],
}