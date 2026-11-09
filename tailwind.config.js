import aspectRatio from '@tailwindcss/aspect-ratio'

// Colors come from CSS variables (see src/index.css) so light and dark share one
// set of class names: `text-ink`, `text-muted`, `bg-surface`, `text-accent`.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        accent: token('accent'),
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [aspectRatio],
}
