import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem('sidebar-collapsed', c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`scrim ${mobileOpen ? 'show' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`main ${collapsed ? 'collapsed' : ''}`}>
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
}
