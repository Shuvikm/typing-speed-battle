/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pirate-red': '#FF4444',
        'pirate-yellow': '#FFD700',
        'neon-blue': '#00D9FF',
        'neon-purple': '#B026FF',
        'hacker-green': '#00FF41',
        'dark-bg': '#0a0a0f',
        'dark-card': '#1a1a2e',
      },
      fontFamily: {
        'anime': ['Orbitron', 'Rajdhani', 'Audiowide', 'Arial', 'sans-serif'],
        'manga': ['Bangers', 'Creepster', 'Orbitron', 'Arial', 'sans-serif'],
        'display': ['Audiowide', 'Orbitron', 'Rajdhani', 'Arial', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'matrix-fall': 'matrix-fall 20s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-in',
        'opacity-pulse': 'opacity-pulse 3s ease-in-out infinite',
        'opacity-wave': 'opacity-wave 4s ease-in-out infinite',
        'opacity-fade-bg': 'opacity-fade-bg 5s ease-in-out infinite',
        'glow-opacity': 'glow-opacity 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 5px #00D9FF, 0 0 10px #00D9FF, 0 0 15px #00D9FF' },
          '100%': { 'box-shadow': '0 0 10px #B026FF, 0 0 20px #B026FF, 0 0 30px #B026FF' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'matrix-fall': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'opacity-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        'opacity-wave': {
          '0%, 100%': { opacity: '0.2' },
          '25%': { opacity: '0.6' },
          '50%': { opacity: '0.4' },
          '75%': { opacity: '0.7' },
        },
        'opacity-fade-bg': {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.05)' },
        },
        'glow-opacity': {
          '0%': { opacity: '0.6', 'box-shadow': '0 0 10px rgba(0, 217, 255, 0.3)' },
          '100%': { opacity: '1', 'box-shadow': '0 0 30px rgba(176, 38, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

