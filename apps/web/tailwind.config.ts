import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Legacy hierarchy colors (kept for compatibility)
        critical:  '#E74C3C',
        important: '#F39C12',
        necessary: '#3498DB',
        desirable: '#2ECC71',
        optional:  '#95A5A6',
        // Design system — backgrounds
        'df-base':     'var(--bg-base)',
        'df-surface':  'var(--bg-surface)',
        'df-elevated': 'var(--bg-elevated)',
        'df-border':   'var(--bg-border)',
        // Design system — accent
        'df-accent':       'var(--accent)',
        'df-accent-hover': 'var(--accent-hover)',
        // Design system — text
        'df-primary':   'var(--text-primary)',
        'df-secondary': 'var(--text-secondary)',
        'df-tertiary':  'var(--text-tertiary)',
        'df-code':      'var(--text-code)',
        // Design system — status
        'df-done':     'var(--status-done)',
        'df-progress': 'var(--status-progress)',
        'df-pending':  'var(--status-pending)',
        'df-alert':    'var(--status-alert)',
        // Design system — module types
        'df-frontend':    'var(--type-frontend)',
        'df-backend':     'var(--type-backend)',
        'df-database':    'var(--type-database)',
        'df-auth':        'var(--type-auth)',
        'df-infra':       'var(--type-infra)',
        'df-integration': 'var(--type-integration)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
export default config
