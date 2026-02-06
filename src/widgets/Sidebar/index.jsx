import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import LogoutButton from '../../features/auth/logout/ui/LogoutButton';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: <HomeIcon />, label: 'Главная', path: '/home' },
    { icon: <FeedIcon />, label: 'Лента', path: '/feed' },
    { icon: <MessageIcon />, label: 'Сообщения', path: '/messages' },
    { icon: <MapIcon />, label: 'Маршруты', path: '/trips' },
    { icon: <HeartIcon />, label: 'Вишлист', path: '/wishlist' },
    { icon: <BookmarkIcon />, label: 'Сохранённые', path: '/saved' },
    { icon: <SettingsIcon />, label: 'Настройки', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  const sidebarClass = `${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`;

  return (
    <>
      {/* Mobile hamburger */}
      <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <aside className={sidebarClass}>
        {/* Header: logo + collapse toggle */}
        <div className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/home')}>
            <span className={styles.logoIcon}><GlobeIcon /></span>
            {!collapsed && <span className={styles.logoText}>TravelFlow</span>}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Развернуть' : 'Свернуть'}
          >
            <ChevronIcon flipped={collapsed} />
          </button>
        </div>

        {/* User card */}
        <div
          className={styles.userCard}
          onClick={() => navigate('/profile')}
          title={collapsed ? 'Sarah' : ''}
        >
          <div className={styles.avatar}>S</div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <div className={styles.userName}>Sarah</div>
              <div className={styles.userBadge}>Супер-турист</div>
            </div>
          )}
        </div>

        {/* Stats - hidden when collapsed */}
        {!collapsed && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>24</div>
              <div className={styles.statLabel}>Страны</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>47</div>
              <div className={styles.statLabel}>Поездки</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>2.4K</div>
              <div className={styles.statLabel}>Друзья</div>
            </div>
          </div>
        )}

        <div className={styles.divider} />

        {/* Navigation */}
        <nav className={styles.nav}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ''}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!collapsed && <span className={styles.label}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={styles.spacer} />

        {/* Logout */}
        <div className={styles.logoutWrap} title={collapsed ? 'Выйти' : ''}>
          <LogoutButton className={styles.logoutBtn} collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

/* ── SVG Icons ── */

function ChevronIcon({ flipped }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16" />
      <path d="M16 6v16" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}