import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useAppMotion } from '../../lib/motion';

// Language switcher. `variant="editorial"` matches the light login nav;
// default matches the app topbar.
export default function LanguageMenu({ variant = 'app' }) {
  const { lang, setLang, languages } = useLang();
  const m = useAppMotion();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className={variant === 'editorial' ? 'tl-lang-wrap' : 'bell-wrap'} ref={ref} style={{ position: 'relative' }}>
      {variant === 'editorial' ? (
        <button className="tl-lang" type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
          <Globe size={17} /> {current.short} <ChevronDown size={14} />
        </button>
      ) : (
        <button className="icon-btn" type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Language" style={{ width: 'auto', padding: '0 10px', gap: 6, display: 'inline-flex', alignItems: 'center' }}>
          <Globe size={18} /> <span className="small strong">{current.short}</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div className="menu" role="menu" style={{ top: variant === 'editorial' ? 40 : 42, right: 0 }} {...m.dropdown}>
            {languages.map((l) => (
              <button
                key={l.code} className="menu-item" role="menuitemradio" aria-checked={l.code === lang}
                onClick={() => { setLang(l.code); setOpen(false); }}
              >
                <span style={{ width: 16, display: 'inline-flex' }}>{l.code === lang && <Check size={15} />}</span>
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
