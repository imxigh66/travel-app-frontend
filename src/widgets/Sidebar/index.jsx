import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import LogoutButton from '../../features/auth/logout/ui/LogoutButton';

const SECTIONS = [
  {
    label: 'MENU',
    items: [
      { icon: <HomeIcon />,     label: 'Explore',     path: '/explore' },
      { icon: <FeedIcon />,     label: 'Лента',       path: '/feed' },
      { icon: <MapIcon />,      label: 'Маршруты',    path: '/trips' },
    ],
  },
  {
    label: 'COLLECTIONS',
    items: [
      { icon: <BookmarkIcon />, label: 'Сохранённые', path: '/saved' },
      { icon: <PinPlusIcon />,  label: 'Мои места',   path: '/my-places' },
    ],
  },
];

const BOTTOM_ITEMS = [
  { icon: <HomeIcon />,     label: 'Explore',  path: '/explore' },
  { icon: <FeedIcon />,     label: 'Лента',    path: '/feed' },
  { icon: <MapIcon />,      label: 'Маршруты', path: '/trips' },
  { icon: <BookmarkIcon />, label: 'Сохранено',path: '/saved' },
  { icon: <ProfileIcon />,  label: 'Профиль',  path: '/profile' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const wrapClass = `${styles.sidebarWrap} ${collapsed ? styles.collapsed : ''}`;

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className={wrapClass}>
        <aside className={styles.sidebar}>

          {/* Logo + collapse */}
          <div className={styles.header}>
            <div className={styles.logo} onClick={() => navigate('/explore')}>
              <span className={styles.logoIcon}><PinIcon /></span>
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

          {/* Nav sections */}
          {SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <div className={styles.sectionLabel}>{section.label}</div>
              )}
              <nav className={styles.nav}>
                {section.items.map((item) => (
                  <button
                    key={item.path}
                    className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : ''}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    {!collapsed && <span className={styles.label}>{item.label}</span>}
                  </button>
                ))}
              </nav>
            </div>
          ))}

          <div className={styles.spacer} />

          <div className={styles.logoutWrap} title={collapsed ? 'Выйти' : ''}>
            <LogoutButton className={styles.logoutBtn} collapsed={collapsed} />
          </div>

        </aside>
      </div>

      {/* ── Mobile bottom bar ── */}
      <nav className={styles.bottomBar}>
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`${styles.bottomItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className={styles.bottomIcon}>{item.icon}</span>
            <span className={styles.bottomLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

/* ── Icons ── */
function PinIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
}
function ChevronIcon({ flipped }) {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: flipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><polyline points="15 18 9 12 15 6"/></svg>;
}
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function FeedIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>;
}
function MapIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function BookmarkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
}
function ProfileIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function PinPlusIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="15"/><line x1="9" y1="10" x2="15" y2="10"/></svg>;
}