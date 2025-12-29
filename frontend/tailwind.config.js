/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diablo: {
          dark: '#0a0a0a',
          medium: '#1a1410',
          panel: '#241c18',
          gold: '#d4af37',
          'gold-light': '#f4d03f',
          'gold-dark': '#b8941f',
          red: '#8b0000',
          'red-flame': '#ff4500',
          'red-blood': '#6b0000',
          border: '#3d2817',
        },
      },
      fontFamily: {
        'diablo': ['Exocet', 'serif'],
      },
    },
  },
  plugins: [],
}
