import { tokens, tokensDark } from "@/design/tokens";

/** Variables CSS Lift — alignées strictement avec `tokens.ts`. */
export function buildLiftCssBlocks(): string {
  const { color: lc } = tokens;
  const { color: dc } = tokensDark;
  const { radius } = tokens;

  const radiusVars = Object.entries(radius)
    .map(([k, v]) => `--lift-radius-${k}:${String(v)}px`)
    .join(";");

  const spacingVars = Object.entries(tokens.spacing)
    .map(([k, v]) => `--lift-spacing-${k}:${String(v)}px`)
    .join(";");

  const lightVars = `
--lift-bg-primary:${lc.bg.primary};
--lift-bg-secondary:${lc.bg.secondary};
--lift-bg-card:${lc.bg.card};
--lift-bg-elevated:${lc.bg.elevated};
--lift-bg-inverse:${lc.bg.inverse};
--lift-text-primary:${lc.text.primary};
--lift-text-secondary:${lc.text.secondary};
--lift-text-tertiary:${lc.text.tertiary};
--lift-text-muted:${lc.text.muted};
--lift-text-inverse:${lc.text.inverse};
--lift-accent-primary:${lc.accent.primary};
--lift-accent-primary-hover:${lc.accent.primaryHover};
--lift-accent-warm:${lc.accent.warm};
--lift-accent-muted:${lc.accent.muted};
--lift-semantic-success:${lc.semantic.success};
--lift-semantic-warning:${lc.semantic.warning};
--lift-semantic-danger:${lc.semantic.danger};
--lift-semantic-info:${lc.semantic.info};
--lift-border-subtle:${lc.border.subtle};
--lift-border-default:${lc.border.default};
--lift-border-strong:${lc.border.strong};
--lift-border-divider:${lc.border.divider};
--lift-macro-kcal:${lc.macro.kcal};
--lift-macro-protein:${lc.macro.protein};
--lift-macro-carbs:${lc.macro.carbs};
--lift-macro-fats:${lc.macro.fats};
${radiusVars};
${spacingVars}`;

  const darkSuffix = `
--lift-bg-primary:${dc.bg.primary};
--lift-bg-secondary:${dc.bg.secondary};
--lift-bg-card:${dc.bg.card};
--lift-bg-elevated:${dc.bg.elevated};
--lift-bg-inverse:${dc.bg.inverse};
--lift-text-primary:${dc.text.primary};
--lift-text-secondary:${dc.text.secondary};
--lift-text-tertiary:${dc.text.tertiary};
--lift-text-muted:${dc.text.muted};
--lift-text-inverse:${dc.text.inverse};
--lift-accent-primary:${dc.accent.primary};
--lift-accent-primary-hover:${dc.accent.primaryHover};
--lift-accent-warm:${dc.accent.warm};
--lift-accent-muted:${dc.accent.muted};
--lift-border-subtle:${dc.border.subtle};
--lift-border-default:${dc.border.default};
--lift-border-strong:${dc.border.strong};
--lift-border-divider:${dc.border.divider};`;

  return `:root,:root:not([data-theme=dark]),[data-theme=light]{${lightVars}}
[data-theme=dark]{${darkSuffix}}`;
}
