import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, LogOut } from 'lucide-react';
import { duration, ease } from '../../lib/motion';

// Product-preview slider for the auth brand panel. Each slide is a self-
// contained mockup of a real feature, so the imagery always corroborates what
// the product does (no external image hosting / licensing / broken links).
// Auto-advances, pauses on hover/focus, and stops entirely under
// prefers-reduced-motion (no auto-moving content for those users).

function CheckInMock() {
  return (
    <div className="mock">
      <div className="mock-chrome"><span className="d" /><span className="d" /><span className="d" /><span className="mock-tab">Check-in</span></div>
      <div className="mock-body">
        <div className="mock-clock">09:14:32</div>
        <div className="mock-clock-sub">Tuesday, 29 July</div>
        <div className="mock-session"><span className="dot" /> On the clock · 4h 12m</div>
        <div className="mock-btns">
          <span className="mock-btn ok"><Check size={14} /> Checked in</span>
          <span className="mock-btn ghost"><LogOut size={14} /> Check out</span>
        </div>
      </div>
    </div>
  );
}

const ROWS = [
  { name: 'Ada Lovelace', dept: 'Engineering', status: 'present', in: 'AL' },
  { name: 'Marcus Boyd', dept: 'Sales', status: 'late', in: 'MB' },
  { name: 'Priya Nair', dept: 'Design', status: 'remote', in: 'PN' },
];
function RegisterMock() {
  return (
    <div className="mock">
      <div className="mock-chrome"><span className="d" /><span className="d" /><span className="d" /><span className="mock-tab">Today · 3 checked in</span></div>
      <div className="mock-body" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {ROWS.map((r) => (
          <div className="mock-row" key={r.name}>
            <span className="mock-av">{r.in}</span>
            <div>
              <div className="mock-name">{r.name}</div>
              <div className="mock-dept">{r.dept}</div>
            </div>
            <span className={`pill pill-${r.status}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BARS = [52, 68, 44, 80, 61, 90, 74];
function AnalyticsMock() {
  return (
    <div className="mock">
      <div className="mock-chrome"><span className="d" /><span className="d" /><span className="d" /><span className="mock-tab">This month</span></div>
      <div className="mock-body">
        <div className="mock-stats">
          <div className="mock-stat"><div className="k">On-time rate</div><div className="v">94%</div></div>
          <div className="mock-stat"><div className="k">Avg. hours / day</div><div className="v">7h 48m</div></div>
        </div>
        <div className="mock-bars" aria-hidden="true">
          {BARS.map((h, i) => <span key={i} className="mock-bar" style={{ height: `${h}%` }} />)}
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  { id: 'checkin', node: <CheckInMock />, title: 'One-tap check-in', caption: 'Clock in and out in a tap, with your live session time always visible.' },
  { id: 'register', node: <RegisterMock />, title: 'See your whole team', caption: "Know who's in, who's late, and who's remote — updated in real time." },
  { id: 'analytics', node: <AnalyticsMock />, title: 'Reports payroll can trust', caption: 'Punctuality, hours, and absence trends — export-ready for payroll.' },
];

export default function AuthShowcase() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [reduce, paused]);

  const slide = SLIDES[i];
  const anim = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: duration.instant } }
    : {
        initial: { opacity: 0, y: 14, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: duration.base } },
        transition: { duration: duration.deliberate, ease: ease.decelerate },
      };

  return (
    <div
      className="auth-showcase"
      aria-roledescription="carousel" aria-label="Product highlights"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
    >
      <div className="showcase-stage">
        <AnimatePresence mode="wait">
          <motion.div className="showcase-slide" key={slide.id} {...anim}
            aria-label={`${i + 1} of ${SLIDES.length}: ${slide.title}`}>
            {slide.node}
            <div className="showcase-caption">
              <h3>{slide.title}</h3>
              <p>{slide.caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="showcase-dots" role="tablist" aria-label="Choose slide">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id} type="button" role="tab"
            className={`showcase-dot ${idx === i ? 'on' : ''}`}
            aria-selected={idx === i} aria-label={`Show ${s.title}`}
            onClick={() => setI(idx)}
          />
        ))}
      </div>
    </div>
  );
}
