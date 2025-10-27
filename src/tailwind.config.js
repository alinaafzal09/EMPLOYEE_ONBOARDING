/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🚨 MUST BE CORRECT: Tailwind needs to scan your files!
  content: [
    "./index.css",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is crucial
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
