/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#141414",
        primary: "#A3E635",
        secondary: "#F97316",
        text: "#FAFAFA",
        muted: "#737373",
        protein: "#3B82F6",
        carbs: "#F59E0B",
        fats: "#EF4444",
      },
    },
  },
  plugins: [],
};
