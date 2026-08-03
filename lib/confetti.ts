import confetti from 'canvas-confetti';

export function fireConfetti(options?: confetti.Options) {
  if (typeof window !== 'undefined') {
    try {
      confetti(options);
    } catch (e) {
      console.warn('Confetti trigger ignored:', e);
    }
  }
}

export default fireConfetti;
