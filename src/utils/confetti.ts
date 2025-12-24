import confetti from "canvas-confetti";

export interface ConfettiOrigin {
  x: number;
  y: number;
}

export function triggerConfetti(origin?: ConfettiOrigin) {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    if (origin) {
      confetti({
        ...defaults,
        particleCount,
        origin,
      });
    } else {
      // since particles fall down, start a bit higher than random
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
    }
  }, 250);
}

export function triggerBurst(origin?: ConfettiOrigin) {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: origin || { y: 0.6 },
    zIndex: 10000,
    colors: ["#FFD700", "#FF6347", "#00CED1", "#FF69B4", "#7B68EE"], // Vibrant colors
  });
}
