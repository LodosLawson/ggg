/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['Courier New', 'monospace'], // Fallback for a pixel look
      },
      colors: {
        'space-black': '#050505',
        'star-white': '#fffff0',
      }
    },
  },
  plugins: [],
}
