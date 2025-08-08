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
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounce 0.5s ease-out',
      },
      transitionDuration: {
        '150': '150ms',
      }
    },
  },
  plugins: [],
  // Optimize for production
  corePlugins: {
    // Disable unused plugins
    preflight: true,
    // Keep only what we need
  }
}