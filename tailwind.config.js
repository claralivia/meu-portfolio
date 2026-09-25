import aspectRatio from '@tailwindcss/aspect-ratio'
import colors from 'tailwindcss/colors'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neutral-900': colors.neutral[900],
        'neutral-100': colors.neutral[100],
        'gradient-start': '#FFEDD5',
        'gradient-end': '#FECACA',
        'dark-gradient-start': colors.neutral[900],
        'dark-gradient-end': colors.neutral[800],
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        blob: 'blob 12s infinite ease-in-out',
        'color-1': 'color1 15s infinite alternate ease-in-out',
        'color-2': 'color2 18s infinite alternate ease-in-out',
        'color-3': 'color3 20s infinite alternate ease-in-out',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 25px) scale(0.9)' },
        },
        color1: {
          '0%': { background: 'rgba(147, 197, 253, 0.6)' },
          '50%': { background: 'rgba(244, 114, 182, 0.5)' },
          '100%': { background: 'rgba(96, 165, 250, 0.6)' },
        },
        color2: {
          '0%': { background: 'rgba(251, 191, 36, 0.6)' },
          '50%': { background: 'rgba(110, 231, 183, 0.5)' },
          '100%': { background: 'rgba(251, 146, 60, 0.6)' },
        },
        color3: {
          '0%': { background: 'rgba(52, 211, 153, 0.5)' },
          '50%': { background: 'rgba(192, 132, 252, 0.4)' },
          '100%': { background: 'rgba(45, 212, 191, 0.5)' },
        },
      },
    },
  },
  plugins: [aspectRatio],
}
