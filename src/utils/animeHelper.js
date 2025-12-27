import anime from 'animejs';

// Anime.js helper functions for consistent animations
export const animeAnimations = {
  // Fade in with opacity
  fadeIn: (targets, duration = 1000) => {
    return anime({
      targets,
      opacity: [0, 1],
      duration,
      easing: 'easeOutQuad',
    });
  },

  // Fade out with opacity
  fadeOut: (targets, duration = 1000) => {
    return anime({
      targets,
      opacity: [1, 0],
      duration,
      easing: 'easeInQuad',
    });
  },

  // Pulse opacity animation
  pulseOpacity: (targets, minOpacity = 0.3, maxOpacity = 1, duration = 2000) => {
    return anime({
      targets,
      opacity: [minOpacity, maxOpacity],
      duration,
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true,
    });
  },

  // Float animation with opacity
  floatWithOpacity: (targets) => {
    return anime({
      targets,
      translateY: [-20, 20],
      opacity: [0.6, 1],
      duration: 3000,
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true,
    });
  },

  // Glow effect with opacity
  glowOpacity: (targets) => {
    return anime({
      targets,
      boxShadow: [
        '0 0 10px rgba(0, 217, 255, 0.3)',
        '0 0 30px rgba(176, 38, 255, 0.6)',
        '0 0 10px rgba(0, 217, 255, 0.3)',
      ],
      opacity: [0.7, 1, 0.7],
      duration: 2000,
      easing: 'easeInOutQuad',
      loop: true,
    });
  },

  // Stagger animation for multiple elements
  staggerFadeIn: (targets, delay = 100) => {
    return anime({
      targets,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(delay),
      duration: 800,
      easing: 'easeOutQuad',
    });
  },

  // Background opacity wave
  backgroundWave: (targets) => {
    return anime({
      targets,
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.05, 1],
      duration: 5000,
      easing: 'easeInOutQuad',
      loop: true,
    });
  },

  // Text reveal with opacity
  textReveal: (targets) => {
    return anime({
      targets,
      opacity: [0, 1],
      translateX: [-50, 0],
      duration: 1000,
      easing: 'easeOutQuad',
    });
  },

  // Character entrance animation
  characterEntrance: (targets) => {
    return anime({
      targets,
      opacity: [0, 1],
      scale: [0.8, 1],
      rotate: [-10, 0],
      duration: 1200,
      easing: 'easeOutElastic(1, .6)',
    });
  },
};

// Initialize animations on mount
export const initAnimeAnimations = () => {
  // Check if elements exist before animating
  const fadeInElements = document.querySelectorAll('[data-anime="fade-in"]');
  const floatElements = document.querySelectorAll('[data-anime="float"]');
  const glowElements = document.querySelectorAll('[data-anime="glow"]');

  if (fadeInElements.length > 0) {
    anime({
      targets: '[data-anime="fade-in"]',
      opacity: [0, 1],
      duration: 1000,
      delay: anime.stagger(100),
      easing: 'easeOutQuad',
    });
  }

  if (floatElements.length > 0) {
    anime({
      targets: '[data-anime="float"]',
      translateY: [-20, 20],
      opacity: [0.6, 1],
      duration: 3000,
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true,
    });
  }

  if (glowElements.length > 0) {
    anime({
      targets: '[data-anime="glow"]',
      boxShadow: [
        '0 0 10px rgba(0, 217, 255, 0.3)',
        '0 0 30px rgba(176, 38, 255, 0.6)',
      ],
      opacity: [0.7, 1],
      duration: 2000,
      easing: 'easeInOutQuad',
      direction: 'alternate',
      loop: true,
    });
  }
};
