/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cisco: {
          dark: '#0B132B',
          card: '#1C2541',
          border: '#3A506B',
          cyan: '#00B4D8',
          blue: '#0077B6',
          accent: '#48CAE4',
          pass: '#10B981',
          fail: '#EF4444',
          warning: '#F59E0B'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
