import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#08090A",
        surface: "#0F1011",
        "surface-2": "#16181B",
        border: "rgba(255,255,255,0.06)",
        "border-strong": "rgba(255,255,255,0.12)",
        text: "#F5F5F5",
        "text-soft": "#B4B4B8",
        muted: "#6E6E76",
        primary: "#A3E635",
        "primary-hover": "#B4F345",
        "primary-soft": "rgba(163,230,53,0.12)",
        secondary: "#FB923C",
        protein: "#60A5FA",
        carbs: "#FBBF24",
        fats: "#F87171",
        success: "#34D399",
        warning: "#FBBF24",
        danger: "#F87171",
        info: "#60A5FA",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "inner-primary": "inset 0 0 0 1px rgba(163,230,53,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
