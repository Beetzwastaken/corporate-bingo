/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'engineer-blue': '#1e40af',
        'pain-red': '#dc2626',
        'success-green': '#16a34a',
        'warning-orange': '#ea580c',
      },
      fontFamily: {
        'impact': ['Impact', 'Arial Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}