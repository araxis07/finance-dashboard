import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "#F4F7FB",
        panel: "#FFFFFF",
        ink: "#14213D",
        muted: "#61708F",
        stroke: "#DCE5F2",
        accent: "#2563EB",
        accentSoft: "#DBEAFE",
        income: "#10B981",
        expense: "#EF4444",
        teal: "#14B8A6",
        amber: "#F59E0B"
      },
      boxShadow: {
        card: "0 24px 60px -30px rgba(15, 23, 42, 0.22)",
        soft: "0 20px 40px -32px rgba(37, 99, 235, 0.5)",
        insetGlow: "inset 0 1px 0 rgba(255,255,255,0.75)"
      },
      borderRadius: {
        "2xl": "1.5rem"
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"],
        display: ["Avenir Next", "Segoe UI", "Helvetica Neue", "sans-serif"]
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
            transform: "translateY(-6px)"
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
