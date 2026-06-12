/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc7c7",
          300: "#ff9e9e",
          400: "#ff6b6b",
          500: "#f83b3b",
          600: "#e51c1c",
          700: "#c11313",
          800: "#a01414",
          900: "#841818",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
