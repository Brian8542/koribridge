/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Hinge-inspired warm minimalism
        cream: {
          DEFAULT: "#FAF7F2",
          deep: "#F3EEE6",
        },
        plum: {
          50:  "#F1E9EE",
          100: "#E7DBE2",
          200: "#CDB4C4",
          300: "#A9829C",
          400: "#7D4E6E",
          500: "#4A1D3F",
          600: "#3B1732",
          700: "#2E1227",
          DEFAULT: "#4A1D3F",
        },
        coral: {
          50:  "#FBEAE6",
          100: "#F7D5CE",
          300: "#F0937F",
          400: "#E8604C",
          500: "#E8604C",
          600: "#D9503C",
          DEFAULT: "#E8604C",
        },
        sage: {
          50:  "#EDF3EF",
          100: "#DCE8E1",
          300: "#8FB3A0",
          500: "#5B8A72",
          600: "#4E7A63",
          700: "#40664F",
          DEFAULT: "#5B8A72",
        },
        charcoal: "#1E1B18",
        // primary (brand) → plum
        primary: {
          50:  "#F1E9EE",
          100: "#E7DBE2",
          200: "#CDB4C4",
          300: "#A9829C",
          400: "#7D4E6E",
          500: "#4A1D3F",
          600: "#3B1732",
          700: "#2E1227",
          800: "#230E1E",
          900: "#180A15",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          bg:     "#FAF7F2",
          muted:  "#F3EEE6",
          inset:  "#E5DED2",
        },
        // warm greys
        neutral: {
          50:  "#FBF9F6",
          100: "#F3EEE6",
          150: "#ECE5DA",
          200: "#E5DED2",
          300: "#C9C1B4",
          400: "#8A837B",
          500: "#6E675F",
          600: "#57514A",
          700: "#3E3934",
          800: "#2C2823",
          900: "#1E1B18",
        },
        // success/emerald → sage
        emerald: {
          50:  "#EDF3EF",
          100: "#DCE8E1",
          200: "#C2D6CA",
          300: "#8FB3A0",
          400: "#6F9A83",
          500: "#5B8A72",
          600: "#4E7A63",
          700: "#40664F",
          800: "#33523F",
          900: "#273F31",
        },
        // legacy blue accents → plum tints
        blue: {
          50:  "#F1E9EE",
          100: "#E7DBE2",
          200: "#CDB4C4",
          300: "#A9829C",
          400: "#7D4E6E",
          500: "#4A1D3F",
          600: "#3B1732",
          700: "#3B1732",
          800: "#2E1227",
          900: "#230E1E",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard", "Inter", "-apple-system", "BlinkMacSystemFont",
          '"Apple SD Gothic Neo"', '"Helvetica Neue"', "Arial", "sans-serif",
        ],
        serif: [
          '"Noto Serif KR"', '"Playfair Display"', "Georgia", '"Times New Roman"', "serif",
        ],
        korean: [
          "Pretendard", '"Apple SD Gothic Neo"', "system-ui", "sans-serif",
        ],
      },
      fontSize: {
        "2xs":        ["11px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        "display-sm": ["40px", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display":    ["52px", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        "display-lg": ["64px", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        serif: "-0.01em",
        tight:   "-0.02em",
        tighter: "-0.03em",
      },
      spacing: {
        "4.5": "18px",
        "13":  "52px",
        "18":  "72px",
        "22":  "88px",
        "30":  "120px",
        "section": "100px",
      },
      maxWidth: {
        "apple":    "980px",
        "apple-lg": "1200px",
        "apple-sm": "720px",
      },
      boxShadow: {
        xs:        "0 1px 2px rgba(46,18,39,0.05)",
        card:      "0 2px 12px rgba(46,18,39,0.06)",
        "card-md": "0 6px 20px rgba(46,18,39,0.08)",
        "card-lg": "0 12px 36px rgba(46,18,39,0.10)",
        modal:     "0 20px 60px rgba(30,27,24,0.18), 0 6px 16px rgba(30,27,24,0.10)",
        nav:       "0 1px 0 rgba(30,27,24,0.06)",
        toast:     "0 8px 24px rgba(30,27,24,0.14)",
        phone:     "0 32px 80px rgba(30,27,24,0.20), 0 8px 24px rgba(30,27,24,0.10)",
        plum:      "0 4px 16px rgba(74,29,63,0.25)",
      },
      borderRadius: {
        apple:      "18px",
        "apple-md": "22px",
        "apple-lg": "24px",
        "4xl":      "28px",
        "5xl":      "36px",
        "6xl":      "44px",
      },
      animation: {
        "fade-up":  "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":  "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer:    "shimmer 1.8s ease-in-out infinite",
        marquee:    "marquee 28s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.55" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        apple:  "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};
