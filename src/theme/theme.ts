export const colors = {
  background: '#090d16',
  surface: '#1e293b',
  primary: '#38bdf8',
  secondary: '#a855f7',
  accent: '#fbbf24',
  success: '#34d399',
  danger: '#ef4444',
  warning: '#f59e0b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  card: '#0f172a',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 20, fontWeight: '600' as const, color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '500' as const, color: colors.textMuted },
  body: { fontSize: 14, color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
};

export const theme = {
  colors,
  spacing,
  typography,
};
