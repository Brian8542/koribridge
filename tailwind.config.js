/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#FFF0F2",
          100: "#FFD6DB",
          200: "#FFADB8",
          300: "#FF7A8A",
          400: "#F54558",
          500: "#C0182B",
          600: "#A01020",
          700: "#820D1A",
          800: "#620A14",
          900: "#48070E",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          bg:     "#F8F9FA",
          muted:  "#F1F3F5",
          inset:  "#E5E7EB",
        },
        neutral: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          150: "#EBEBEC",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
        },
        brand: {
          red:  "#C0182B",
          warm: "#F8F9FA",
        },
      },
      fontFamily: {
        sans:   ["Pretendard", "Inter", "Noto Sans KR", "system-ui", "sans-serif"],
        korean: ["Pretendard", "Noto Sans KR", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px", letterSpacing: "0.01em" }],
      },
      spacing: {
        "4.5": "18px",
        "13":  "52px",
        "18":  "72px",
      },
      boxShadow: {
        xs:         "0 1px 2px rgba(0,0,0,0.04)",
        card:       "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-md":  "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "card-lg":  "0 8px 24px rgba(0,0,0,0.1),  0 2px 6px rgba(0,0,0,0.06)",
        modal:      "0 20px 60px rgba(0,0,0,0.14), 0 6px 16px rgba(0,0,0,0.08)",
        nav:        "0 1px 0 rgba(0,0,0,0.06)",
        toast:      "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
        "red-sm":   "0 2px 8px rgba(192,24,43,0.25)",
        "red-md":   "0 4px 16px rgba(192,24,43,0.3)",
      },
      borderRadius: {
        "4xl": "28px",
      },
      animation: {
        "fade-up":    "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":    "fadeIn 0.3s ease-out forwards",
        "slide-up":   "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer:      "shimmer 1.6s linear infinite",
        marquee:      "marquee 28s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
