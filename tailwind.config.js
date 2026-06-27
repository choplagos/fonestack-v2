/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      // xs: 2-col grid on iPhone SE (375px) and very small Androids
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
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
        display: ['Sora', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        '2xl': '40px',
      }
    },
  },
  plugins: [],
}