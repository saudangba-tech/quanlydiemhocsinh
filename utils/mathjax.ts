import { useEffect } from 'react';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
      startup?: any;
    };
    Swal?: any;
    XLSX?: any;
    marked?: {
      parse: (md: string) => string;
    };
    confetti?: (options?: any) => void;
  }
}

export function renderMathJax() {
  if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
    window.MathJax.typesetPromise().catch((err: any) => {
      console.warn('MathJax typesetting error:', err);
    });
  }
}

export function useMathJax(dependencies: any[] = []) {
  useEffect(() => {
    // Timeout gives React time to commit DOM
    const timer = setTimeout(() => {
      renderMathJax();
    }, 80);
    return () => clearTimeout(timer);
  }, dependencies);
}

export function fireConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
