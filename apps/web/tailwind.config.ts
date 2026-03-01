import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        critical: '#E74C3C',
        important: '#F39C12',
        necessary: '#3498DB',
        desirable: '#2ECC71',
        optional: '#95A5A6',
      },
    },
  },
  plugins: [],
}
export default config
