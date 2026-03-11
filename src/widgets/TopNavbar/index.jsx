import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../entities/user/api/userApi';
import styles from './TopNavbar.module.css';

const LANGUAGES = [
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
];

export default function TopNavbar({ onUserLoad, collapsed = false }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState('RU');
  const [openDrop, setOpenDrop] = useState(null); // 'avatar' | 'notif' | 'lang' | null

  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    getCurrentUser().then(result => {
      if (result.success && result.data) {
        setCurrentUser(result.data);
        if (onUserLoad) onUserLoad(result.data);
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    }).catch(() => { navigate('/login'); setIsLoading(false); });
  }, []);

  // Закрыть при клике вне
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenDrop(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (name) => setOpenDrop(prev => prev === name ? null : name);

  const getInitials = () => {
    if (!currentUser?.username) return '?';
    return currentUser.username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setOpenDrop(null);
    navigate('/login');
  };

  return (
    <header className={styles.navbar} ref={ref}>
      <div className={styles.inner}>

        {/* Messages */}
        <button
          className={styles.iconBtn}
          onClick={() => navigate('/messages')}
          title="Сообщения"
        >
          <MessageIcon />
        </button>

        {/* Notifications */}
        <div className={styles.dropdownWrap}>
          <button
            className={`${styles.iconBtn} ${openDrop === 'notif' ? styles.open : ''}`}
            onClick={() => toggle('notif')}
            title="Уведомления"
          >
            <BellIcon />
            {/* раскомментируй когда появятся уведомления: */}
            {/* <span className={styles.dot} /> */}
          </button>
          {openDrop === 'notif' && (
            <div className={`${styles.dropdown} ${styles.notifDropdown}`}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Уведомления</span>
                <button className={styles.notifMarkAll}>Прочитать все</button>
              </div>
              <div className={styles.notifEmpty}>
                <span className={styles.notifEmptyIcon}>🔔</span>
                Пока нет уведомлений
              </div>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Language */}
        <div className={styles.dropdownWrap}>
          <button
            className={`${styles.langBtn} ${openDrop === 'lang' ? styles.open : ''}`}
            onClick={() => toggle('lang')}
            title="Язык"
          >
            <span className={styles.langFlag}>
              {LANGUAGES.find(l => l.code === lang)?.flag}
            </span>
            {lang}
            <ChevronIcon />
          </button>
          {openDrop === 'lang' && (
            <div className={`${styles.dropdown} ${styles.langDropdown}`}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`${styles.langOption} ${lang === l.code ? styles.selected : ''}`}
                  onClick={() => { setLang(l.code); setOpenDrop(null); }}
                >
                  <span className={styles.langFlag}>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Avatar */}
        <div className={styles.dropdownWrap}>
          {isLoading
            ? <div className={styles.avatarSkeleton} />
            : (
              <>
                <button
                  className={`${styles.avatarBtn} ${openDrop === 'avatar' ? styles.open : ''}`}
                  onClick={() => toggle('avatar')}
                >
                  {currentUser?.profilePicture
                    ? <img src={currentUser.profilePicture} alt="" className={styles.avatar} />
                    : <div className={styles.avatarFallback}>{getInitials()}</div>
                  }
                  <span className={styles.avatarChevron}><ChevronIcon /></span>
                </button>

                {openDrop === 'avatar' && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>
                        {currentUser?.name || currentUser?.username}
                      </div>
                      <div className={styles.dropdownUsername}>
                        @{currentUser?.username}
                      </div>
                    </div>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/profile'); setOpenDrop(null); }}
                    >
                      <ProfileIcon /> Профиль
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/settings'); setOpenDrop(null); }}
                    >
                      <SettingsIcon /> Настройки
                    </button>

                    <div className={styles.dropdownSep} />

                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={handleLogout}
                    >
                      <LogoutIcon /> Выйти
                    </button>
                  </div>
                )}
              </>
            )
          }
        </div>

      </div>
    </header>
  );
}

/* ── Icons ── */
function MessageIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
}
function BellIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}
function ChevronIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function ProfileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
}
function LogoutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}