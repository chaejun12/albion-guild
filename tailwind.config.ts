import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        albion: {
          gold: '#C8A84B',
          dark: '#0F1419',
          panel: '#1A2030',
          border: '#2A3448',
          hover: '#253045',
        },
      },
    },
  },
  plugins: [],
}
export default config
