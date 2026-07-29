import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Clock, CalendarDays, ShieldCheck, Sun, Moon, LogOut, CornerDownLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAppMotion } from '../../lib/motion';

// Cmd+K command palette. Keyboard-first: ↑/↓ to move, ↵ to run, Esc to close.
export default function CommandPalette({ open, onClose }) {
  const m = useAppMotion();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const commands = useMemo(() => {
    const go = (to) => () => { navigate(to); onClose(); };
    const items = [
      { id: 'dashboard', label: 'Go to Dashboard', hint: 'Overview', icon: LayoutDashboard, group: 'Navigate', run: go('/dashboard') },
      { id: 'attendance', label: 'Go to Attendance', hint: 'Clock in / out', icon: Clock, group: 'Navigate', run: go('/attendance') },
      { id: 'leave', label: 'Go to Leave', hint: 'Time off', icon: CalendarDays, group: 'Navigate', run: go('/leave') },
    ];
    if (user?.role === 'admin') {
      items.push({ id: 'admin', label: 'Go to Admin Console', hint: 'Manage org', icon: ShieldCheck, group: 'Navigate', run: go('/admin') });
    }
    items.push(
      { id: 'theme', label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', hint: 'Appearance', icon: theme === 'dark' ? Sun : Moon, group: 'Actions', run: () => { toggle(); onClose(); } },
      { id: 'logout', label: 'Sign out', hint: 'End session', icon: LogOut, group: 'Actions', run: () => { logout(); navigate('/login'); onClose(); } },
    );
    return items;
  }, [user, theme, navigate, onClose, toggle, logout]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => { if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 20); } }, [open]);
  useEffect(() => { setActive(0); }, [query]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[active]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, filtered]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="cmdk-scrim" {...m.scrim} onClick={onClose}>
          <motion.div
            className="cmdk" role="dialog" aria-modal="true" aria-label="Command palette"
            {...m.panel} onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}
          >
            <div className="cmdk-input-row">
              <Search size={18} />
              <input
                ref={inputRef} className="cmdk-input" placeholder="Search commands…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list"
              />
              <span className="kbd">Esc</span>
            </div>
            <div className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef}>
              {filtered.length === 0 ? (
                <div className="cmdk-empty">No commands match “{query}”.</div>
              ) : (
                filtered.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.id} role="option" aria-selected={i === active}
                      className="cmdk-item" onMouseEnter={() => setActive(i)} onClick={c.run}
                    >
                      <span className="c-ico"><Icon size={16} /></span>
                      <div>
                        <div>{c.label}</div>
                        <div className="c-sub">{c.group} · {c.hint}</div>
                      </div>
                      {i === active && <CornerDownLeft size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
