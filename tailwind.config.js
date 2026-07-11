/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tennis: {
          dark: '#0d2114',
          brand: '#13301c',
          neon: '#a3cb00',
          accent: '#306c42',
          light: '#f4f7f4',
          border: '#d0dfd5'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
