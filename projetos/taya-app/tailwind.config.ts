import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#F0F0F0",
        foreground: "#231E19",
        brand: {
          DEFAULT: "var(--brand)",
          light: "var(--brand-light)",
          dark: "var(--brand-dark)",
          gradient: "linear-gradient(to bottom, var(--brand-gradient-start), var(--brand-gradient-end))",
        },
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "#FFFFFF",
          light: "var(--brand-light)",
          dark: "var(--brand-dark)",
        },
        gold: "#FFCC05",
        ocean: {
          dark: "#0A4F73",
          light: "#67C7F0",
        },
        secondary: {
          DEFAULT: "#F0F0F0",
          foreground: "#231E19",
        },
        muted: {
          DEFAULT: "#F0F0F0",
          foreground: "#78716C",
        },
        border: "#E7E5E4",
        card: "#FFFFFF",
        success: {
          DEFAULT: "#16A34A",
          light: "#F0FDF4",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FFFBEB",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        xl: "0.875rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(28,25,23,0.08), 0 1px 2px rgba(28,25,23,0.06)",
        "card-hover": "0 4px 12px rgba(28,25,23,0.12)",
        app: "0 20px 40px rgba(28,25,23,0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config;
