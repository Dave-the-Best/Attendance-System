import { useEffect, useRef, useState } from 'react';

// Counts up to `value` on mount / whenever it changes. Handles non-numeric
// values (e.g. "Working", "—") by rendering them as-is.
export default function AnimatedNumber({ value, duration = 900, suffix = '' }) {
  const numeric = typeof value === 'number' && isFinite(value);
  const [display, setDisplay] = useState(numeric ? 0 : value);
  const raf = useRef();
  const from = useRef(0);

  useEffect(() => {
    if (!numeric) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const startVal = from.current;
    const delta = value - startVal;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const current = startVal + delta * eased;
      setDisplay(Number.isInteger(value) ? Math.round(current) : Math.round(current * 10) / 10);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration, numeric]);

  return (
    <>
      {display}
      {numeric ? suffix : ''}
    </>
  );
}
