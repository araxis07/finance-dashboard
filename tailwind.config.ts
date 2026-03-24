import type { Config } from "tailwindcss";

const withOpacity = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        page: withOpacity("--page"),
        pageAlt: withOpacity("--page-alt"),
        panel: withOpacity("--panel"),
        surface: withOpacity("--surface"),
        surfaceAlt: withOpacity("--surface-alt"),
        ink: withOpacity("--ink"),
        inkSoft: withOpacity("--ink-soft"),
        muted: withOpacity("--muted"),
        stroke: withOpacity("--stroke"),
        accent: withOpacity("--accent"),
        accentForeground: withOpacity("--accent-foreground"),
        accentSoft: withOpacity("--accent-soft"),
        income: withOpacity("--income"),
        incomeSoft: withOpacity("--income-soft"),
        expense: withOpacity("--expense"),
        expenseSoft: withOpacity("--expense-soft")
      },
      boxShadow: {
        card: "var(--shadow-card)",
        soft: "var(--shadow-soft)",
        insetGlow: "var(--shadow-inset)"
      },
      borderRadius: {
        "2xl": "1.5rem"
      },
      fontFamily: {
        sans: [
          "Noto Sans Thai",
          "Noto Sans JP",
          "Avenir Next",
          "Segoe UI",
          "Helvetica Neue",
          "sans-serif"
        ],
        display: [
          "Noto Sans Thai",
          "Noto Sans JP",
          "Avenir Next",
          "Segoe UI",
          "Helvetica Neue",
          "sans-serif"
        ]
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(14px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)"
          },
          "50%": {
            transform: "translateY(-4px)"
          }
        }
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out",
        float: "float 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
