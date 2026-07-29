import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, Sun, Moon, LogOut, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LanguageContext';
import { initials } from '../../lib/format';
import { useAppMotion } from '../../lib/motion';
import LanguageMenu from '../ui/LanguageMenu';
import NotificationBell from '../NotificationBell';

const TITLE_KEYS = {
  '/dashboard': 'nav.dashboard',
  '/attendance': 'nav.attendance',
  '/leave': 'nav.leave',
  '/admin': 'nav.admin',
};

export default function Topbar({ onOpenMobile, onOpenCmdk }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const m = useAppMotion();
  const navigate = useNavigate();
  const loc = useLocation();
  const title = TITLE_KEYS[loc.pathname] ? t(TITLE_KEYS[loc.pathname]) : 'AttendPro';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header className="topbar">
      <button className="icon-btn mobile-toggle" onClick={onOpenMobile} aria-label="Open menu">
        <Menu size={18} />
      </button>

      <nav className="topbar-crumbs" aria-label="Breadcrumb">
        <span>AttendPro</span>
        <ChevronRight size={14} />
        <span className="crumb-current">{title}</span>
      </nav>

      <div className="topbar-spacer" />

      <button className="cmdk-trigger" onClick={onOpenCmdk} aria-label={t('top.search')}>
        <Search size={15} />
        <span className="cmdk-label">{t('top.search')}</span>
        <span className="kbd">⌘K</span>
      </button>

      <div className="topbar-actions">
        <LanguageMenu variant="app" />
        <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? t('menu.light') : t('menu.dark')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationBell />

        <div className="bell-wrap" ref={menuRef}>
          <button className="user-chip" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
            <div className="avatar">{initials(user?.name)}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div className="menu" style={{ top: 44, right: 0 }} role="menu" {...m.dropdown}>
                <div className="menu-head">{user?.email}</div>
                <button className="menu-item" role="menuitem" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
                  <User size={15} /> {t('menu.profile')}
                </button>
                <button className="menu-item" role="menuitem" onClick={() => { toggle(); setMenuOpen(false); }}>
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} {theme === 'dark' ? t('menu.light') : t('menu.dark')}
                </button>
                <div className="menu-sep" />
                <button className="menu-item danger" role="menuitem" onClick={() => { logout(); navigate('/login'); }}>
                  <LogOut size={15} /> {t('menu.signout')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
