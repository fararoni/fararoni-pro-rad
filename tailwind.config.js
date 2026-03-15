/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rad: {
          bg:      '#0d1117',
          surface: '#161b22',
          panel:   '#13181f',
          border:  '#21262d',
          hover:   '#1c2128',
          amber:   '#d97706',
          amberL:  '#fbbf24',
          blue:    '#388bfd',
          green:   '#3fb950',
          red:     '#f85149',
          muted:   '#8b949e',
          text:    '#e6edf3',
          purple:  '#bc8cff',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
