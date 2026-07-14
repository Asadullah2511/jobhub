import designTokens from '../design-tokens.json';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        accent: designTokens.colors.accent,
        success: designTokens.colors.success,
        warning: designTokens.colors.warning,
        error: designTokens.colors.error,
        neutral: designTokens.colors.neutral,
      },
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      fontFamily: {
        sans: designTokens.typography.fontFamily.primary.split(', '),
        display: designTokens.typography.fontFamily.secondary.split(', '),
        mono: designTokens.typography.fontFamily.mono.split(', '),
      },
      fontSize: {
        xs: `${designTokens.typography.fontSize.xs}px`,
        sm: `${designTokens.typography.fontSize.sm}px`,
        base: `${designTokens.typography.fontSize.base}px`,
        lg: `${designTokens.typography.fontSize.lg}px`,
        xl: `${designTokens.typography.fontSize.xl}px`,
        '2xl': `${designTokens.typography.fontSize['2xl']}px`,
        '3xl': `${designTokens.typography.fontSize['3xl']}px`,
        '4xl': `${designTokens.typography.fontSize['4xl']}px`,
        '5xl': `${designTokens.typography.fontSize['5xl']}px`,
        '6xl': `${designTokens.typography.fontSize['6xl']}px`,
      },
    },
  },
  plugins: [],
}
