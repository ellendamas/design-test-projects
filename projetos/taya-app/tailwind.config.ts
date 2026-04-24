import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#E9EAF2",
        foreground: "#020617",
        primary: {
          DEFAULT: "#2E386D",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E1E3ED",
          foreground: "#2E386D",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
        card: "#FFFFFF",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
