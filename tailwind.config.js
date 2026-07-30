/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // `dark:` variants track the manual theme toggle (html[data-theme="dark"]),
  // not the OS media query — so light/dark utility pairs work with our switcher.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── THEME-AWARE TOKENS (driven by CSS vars; see .theme-batman /
        //    .theme-cyber in index.css). Same class names, different palette
        //    depending on which wrapper the app root uses. ────────────────────
        space: 'rgb(var(--space) / <alpha-value>)',
        // Primary foreground/text — flips with the theme (near-white ⇆ near-black).
        fg: 'rgb(var(--fg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        'card-hover': 'rgb(var(--card-hover) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-light': 'rgb(var(--accent-light) / <alpha-value>)',
        coral: 'rgb(var(--coral) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        maroon: 'rgb(var(--maroon) / <alpha-value>)',
        'maroon-deep': 'rgb(var(--maroon-deep) / <alpha-value>)',
        gold: 'rgb(var(--accent) / <alpha-value>)',
        // Cyber-Metal-Black palette additions
        metal: 'rgb(var(--space) / <alpha-value>)',
        forest: 'rgb(var(--forest) / <alpha-value>)',
        'forest-deep': 'rgb(var(--forest-deep) / <alpha-value>)',
        // Jade green secondary (active links, success, glows)
        jade: 'rgb(var(--jade) / <alpha-value>)',
        'jade-light': 'rgb(var(--jade-light) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
        // Futuristic display face — headings, logo, nav (see index.css / components).
        groovy: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'blink': 'blink 1s step-end infinite',
        'float': 'float 6s ease-in-out infinite',
        'breathe': 'breathe 8s ease-in-out infinite',
        'gradient-x': 'gradientX 8s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        // Very subtle "breathing" — gentle scale + opacity, for ambient orbs/glows.
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}
