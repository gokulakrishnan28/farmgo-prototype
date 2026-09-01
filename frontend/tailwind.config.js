/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We'll define a sleek agricultural theme
        brand: {
          light: "#E8F5E9",
          50: "#E8F5E9",
          100: "#C8E6C9",
          500: "#4CAF50",
          600: "#43A047",
          700: "#388E3C",
          DEFAULT: "#4CAF50",
        },
      },
    },
  },
  plugins: [],
}
