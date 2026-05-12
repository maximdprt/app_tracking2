/**
 * Design tokens Lift V3 — source unique pour couleurs, espacements, typo.
 * Le thème expose les mêmes valeurs via variables CSS injectées depuis `token-css-vars.ts`.
 */

export const tokens = {
  color: {
    bg: {
      primary: "#F5F1EA",
      secondary: "#EFE9DD",
      card: "#FFFFFF",
      elevated: "#FBF8F2",
      inverse: "#1A1A1A",
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#5C5043",
      tertiary: "#8A7F6E",
      muted: "#C4B7A0",
      inverse: "#F5F1EA",
    },
    accent: {
      primary: "#1A1A1A",
      primaryHover: "#2A2A2A",
      warm: "#A89880",
      muted: "#C4B7A0",
    },
    semantic: {
      success: "#4A5D3F",
      warning: "#A8843F",
      danger: "#8B3F3F",
      info: "#4F5F7A",
    },
    border: {
      subtle: "#ECE6DA",
      default: "#DCD3BF",
      strong: "#8A7F6E",
      divider: "#E8E1D4",
    },
    /** Anneaux macros : noir + taupe + warm (pas de couleurs vives) */
    macro: {
      kcal: "#1A1A1A",
      protein: "#5C5043",
      carbs: "#8A7F6E",
      fats: "#A89880",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 9999,
  },
  font: {
    family: {
      sans: "Inter",
      display: "InstrumentSerif",
      mono: "JetBrainsMono",
    },
    size: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      "2xl": 24,
      "3xl": 32,
      "4xl": 44,
    },
    weight: { regular: "400", medium: "500", semibold: "600" },
    tracking: { tight: -0.4, normal: 0, wide: 0.5 },
  },
  shadow: {
    none: {},
    xs: {
      shadowColor: "#1A1A1A",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sm: {
      shadowColor: "#1A1A1A",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: "#1A1A1A",
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  },
  animation: { fast: 150, normal: 220, slow: 360 },
} as const;

/** Thème dark (phase 1.b) — inversé */
export const tokensDark = {
  color: {
    bg: {
      primary: "#1A1A1A",
      secondary: "#222222",
      card: "#262626",
      elevated: "#2E2E2E",
      inverse: "#F5F1EA",
    },
    text: {
      primary: "#F5F1EA",
      secondary: "#DCD3BF",
      tertiary: "#A89880",
      muted: "#6B6054",
      inverse: "#1A1A1A",
    },
    accent: {
      primary: "#F5F1EA",
      primaryHover: "#EFE9DD",
      warm: "#8A7F6E",
      muted: "#5C5043",
    },
    semantic: tokens.color.semantic,
    border: {
      subtle: "#3D3D3D",
      default: "#4A453C",
      strong: "#8A7F6E",
      divider: "#333333",
    },
    macro: tokens.color.macro,
  },
} as const;

export type ColorBgKey = keyof typeof tokens.color.bg;
export type ColorTextKey = keyof typeof tokens.color.text;
export type SpacingKey = keyof typeof tokens.spacing;
