import confetti from 'canvas-confetti';

/**
 * MAXIMUM DOPAMINE CONFETTI UTILITIES
 */

/**
 * Clinical confetti colors for Neuroscience Lab Theme
 */
const CLINICAL_COLORS = ['#00d9ff', '#00ff88', '#ffffff'];

/**
 * Full-screen celebration confetti (level ups, session complete)
 */
export const celebrationConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, colors: CLINICAL_COLORS };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

/**
 * Burst confetti from a specific element (badge unlocks)
 */
export const burstConfetti = (element?: HTMLElement) => {
  const rect = element?.getBoundingClientRect();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x, y },
    zIndex: 9999,
    colors: CLINICAL_COLORS,
  });
};

/**
 * Legendary confetti for exceptional achievements (clinical colors)
 */
export const legendaryConfetti = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: CLINICAL_COLORS,
      zIndex: 9999,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: CLINICAL_COLORS,
      zIndex: 9999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};

/**
 * Small sparkle effect for correct answers
 */
export const sparkleConfetti = (element?: HTMLElement) => {
  const rect = element?.getBoundingClientRect();
  const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
  const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;

  confetti({
    particleCount: 20,
    spread: 30,
    startVelocity: 15,
    origin: { x, y },
    colors: CLINICAL_COLORS,
    zIndex: 9999,
  });
};

/**
 * Combo confetti (scales with combo size)
 */
export const comboConfetti = (combo: number) => {
  let particleCount = 50;
  let spread = 50;

  if (combo >= 20) {
    // MEGA COMBO
    particleCount = 200;
    spread = 180;
    legendaryConfetti();
  } else if (combo >= 10) {
    particleCount = 150;
    spread = 120;
  } else if (combo >= 5) {
    particleCount = 100;
    spread = 80;
  }

  confetti({
    particleCount,
    spread,
    origin: { y: 0.6 },
    colors: CLINICAL_COLORS,
    zIndex: 9999,
  });
};

/**
 * Screen shake effect (for huge combos)
 */
export const screenShake = () => {
  const duration = 500;
  const intensity = 5;

  const originalTransform = document.body.style.transform;

  const shake = () => {
    const x = (Math.random() - 0.5) * intensity * 2;
    const y = (Math.random() - 0.5) * intensity * 2;
    document.body.style.transform = `translate(${x}px, ${y}px)`;
  };

  const interval = setInterval(shake, 50);

  setTimeout(() => {
    clearInterval(interval);
    document.body.style.transform = originalTransform;
  }, duration);
};

/**
 * Perfect session confetti rain
 */
export const perfectSessionConfetti = () => {
  const duration = 10000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 90,
      spread: 45,
      startVelocity: 45,
      origin: { x: Math.random(), y: -0.1 },
      colors: CLINICAL_COLORS,
      zIndex: 9999,
      gravity: 1.2,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
};
