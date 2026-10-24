/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        wow: {
          bg: '#060a12',
          panel: '#101726',
          panelDark: '#0b101b',
          panelHeader: '#141d30',
          border: '#3b2f15',
          borderGold: '#8c6e2d',
          gold: '#f8b700',
          goldHover: '#ffd24d',
          goldMuted: '#b38300',
          blue: '#00aeff',
          blueHover: '#42c2ff',
          textMuted: '#94a3b8',
          textLight: '#e2e8f0',
        },
        wowClass: {
          warrior: '#c79c6e',
          mage: '#3fc7eb',
          rogue: '#fff569',
          druid: '#ff7d0a',
          paladin: '#f58cba',
          priest: '#ffffff',
          shaman: '#0070de',
          hunter: '#abd473',
          warlock: '#9482c9',
          deathknight: '#c41f3b',
        },
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Georgia', 'serif'],
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        goldGlow: '0 0 15px rgba(248, 183, 0, 0.35)',
        goldGlowLg: '0 0 25px rgba(248, 183, 0, 0.55)',
        panelInset: 'inset 0 1px 0 rgba(255, 215, 0, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};
