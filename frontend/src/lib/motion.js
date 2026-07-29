// ============================================================
// Motion tokens — single source of truth for animation, mirroring the CSS
// motion tokens in index.css. All framer-motion usage should come from here so
// timing stays consistent and prefers-reduced-motion is honoured everywhere.
// ============================================================
import { useReducedMotion } from 'framer-motion';

export const duration = { instant: 0.1, fast: 0.15, base: 0.2, slow: 0.3, deliberate: 0.45 };
export const ease = {
  standard: [0.2, 0, 0, 1],
  decelerate: [0, 0, 0, 1],
  accelerate: [0.3, 0, 1, 1],
};
export const spring = { type: 'spring', stiffness: 400, damping: 30 };
export const springSoft = { type: 'spring', stiffness: 400, damping: 34 };

const STAGGER = 0.04;
const STAGGER_CAP = 8;
export const staggerDelay = (index = 0) => Math.min(index, STAGGER_CAP) * STAGGER;
const exitOf = (d) => d * 0.6;

export function useAppMotion() {
  const reduce = useReducedMotion();
  const fadeOnly = (d = duration.base) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reduce ? duration.instant : d },
  });

  return {
    reduce,
    page: reduce
      ? fadeOnly(duration.instant)
      : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: duration.fast, ease: ease.standard } },
    rise: (index = 0) =>
      reduce
        ? fadeOnly(duration.instant)
        : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: duration.slow, ease: ease.decelerate, delay: staggerDelay(index) } },
    fade: fadeOnly,
    scrim: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: duration.fast } },
    panel: reduce
      ? fadeOnly(duration.fast)
      : {
          initial: { opacity: 0, scale: 0.96, y: 8 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: exitOf(duration.base) } },
          transition: { duration: duration.base, ease: ease.decelerate },
        },
    dropdown: reduce
      ? fadeOnly(duration.instant)
      : {
          initial: { opacity: 0, y: -6, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: exitOf(duration.fast) } },
          transition: { duration: duration.fast, ease: ease.decelerate },
        },
    slideInLeft: (index = 0) =>
      reduce
        ? fadeOnly(duration.instant)
        : { initial: { opacity: 0, x: -14 }, animate: { opacity: 1, x: 0 }, transition: { duration: duration.slow, ease: ease.decelerate, delay: staggerDelay(index) } },
    tap: reduce ? {} : { whileTap: { scale: 0.97 }, transition: spring },
  };
}
