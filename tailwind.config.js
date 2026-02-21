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
        // New animations
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shake': 'shake 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fire-pulse': 'fire-pulse 0.8s ease-in-out infinite alternate',
        'countdown-pop': 'countdown-pop 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'float-up-fade': 'float-up-fade 1.2s ease-out forwards',
        'letter-drop': 'letter-drop 0.5s ease-out forwards',
        'race-bounce': 'race-bounce 0.5s ease-in-out infinite',
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
          '0%': { opacity: '0.6', 'box-shadow': '0 0 10px rgba(0,217,255,0.3)' },
          '100%': { opacity: '1', 'box-shadow': '0 0 30px rgba(176,38,255,0.6)' },
        },
        // New keyframes
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '80%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-8px)' },
          '80%': { transform: 'translateX(8px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(60px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        'fire-pulse': {
          '0%': { filter: 'drop-shadow(0 0 8px #ff6600)' },
          '100%': { filter: 'drop-shadow(0 0 24px #ff0000) drop-shadow(0 0 8px #ff6600)' },
        },
        'countdown-pop': {
          '0%': { transform: 'scale(0.2) rotate(-10deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(3deg)', opacity: '1' },
          '80%': { transform: 'scale(0.95) rotate(-2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'float-up-fade': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-80px) scale(1.3)', opacity: '0' },
        },
        'letter-drop': {
          '0%': { transform: 'translateY(-40px) rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotateX(0deg)', opacity: '1' },
        },
        'race-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
