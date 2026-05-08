/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: "#141416",
        elevated: "#1C1C20",
        border: "#2A2A2E",
        primary: "#00E676",
        accent: "#FF6B35",
        text: "#FFFFFF",
        textSecondary: "#A0A0A8",
      },
    },
  },
  plugins: [],
};
