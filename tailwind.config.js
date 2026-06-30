/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Apple design system
        apple: {
          bg:          "#f5f5f7",
          text:        "#1d1d1f",
          secondary:   "#86868b",
          blue:        "#0071e3",
          "blue-dark": "#0077ed",
          divider:     "#d2d2d7",
          card:        "#f5f5f7",
          dark:        "#000000",
          "dark-bg":   "#161617",
          "dark-card": "#1c1c1e",
        },
        // KoriBridge primary red — brand accent only (logo, verified badge)
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
          bg:     "#f5f5f7",
          muted:  "#e8e8ed",
          inset:  "#d2d2d7",
        },
        neutral: {
          50:  "#FAFAFA",
          100: "#F5F5F7",
          150: "#E8E8ED",
          200: "#D2D2D7",
          300: "#AEAEB2",
          400: "#86868B",
          500: "#6E6E73",
          600: "#515154",
          700: "#3A3A3C",
          800: "#2D2D2F",
          900: "#1D1D1F",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont",
          '"SF Pro Display"', '"SF Pro Text"',
          '"Apple SD Gothic Neo"', "Pretendard",
          '"Helvetica Neue"', "Arial", "sans-serif",
        ],
        korean: [
          '"Apple SD Gothic Neo"', "Pretendard",
          '"Noto Sans KR"', "system-ui", "sans-serif",
        ],
      },
      fontSize: {
        "2xs":        ["11px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        "display-sm": ["40px", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "display":    ["56px", { lineHeight: "1.07", letterSpacing: "-0.03em" }],
        "display-lg": ["72px", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-xl": ["80px", { lineHeight: "1.04", letterSpacing: "-0.045em" }],
      },
      letterSpacing: {
        tight:   "-0.02em",
        tighter: "-0.03em",
        apple:   "-0.04em",
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
        xs:        "0 1px 2px rgba(0,0,0,0.04)",
        card:      "0 2px 8px rgba(0,0,0,0.06)",
        "card-md": "0 4px 16px rgba(0,0,0,0.08)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.10)",
        modal:     "0 20px 60px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.10)",
        nav:       "0 1px 0 rgba(0,0,0,0.10)",
        toast:     "0 8px 24px rgba(0,0,0,0.12)",
        phone:     "0 32px 80px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)",
        "red-sm":  "0 2px 8px rgba(192,24,43,0.25)",
        "red-md":  "0 4px 16px rgba(192,24,43,0.3)",
      },
      borderRadius: {
        apple:      "18px",
        "apple-md": "22px",
        "apple-lg": "28px",
        "4xl":      "28px",
        "5xl":      "36px",
        "6xl":      "44px",
      },
      animation: {
        "fade-up":  "fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-in":  "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        shimmer:    "shimmer 1.8s linear infinite",
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
        apple:  "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};
