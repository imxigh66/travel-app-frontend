import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../entities/user/api/userApi';
import { placeApi } from '../../entities/place/index';
import api from '../../shared/api/axios';
import { messageApi } from '../../entities/message/api/messageApi';
import styles from './TopNavbar.module.css';

const LANGUAGES = [
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
];

export default function TopNavbar({ onUserLoad, collapsed = false }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [lang, setLang]               = useState('RU');
  const [openDrop, setOpenDrop]       = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const [query, setQuery]                 = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching]         = useState(false);

  const navRef      = useRef(null);
  const searchRef   = useRef(null);
  const searchTimer = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();
  const hideSearch  = location.pathname === '/explore';

  useEffect(() => {
    getCurrentUser().then(result => {
      if (result.success && result.data) {
        setCurrentUser(result.data);
        if (onUserLoad) onUserLoad(result.data);
        messageApi.getConversations()
          .then(data => {
            const list  = Array.isArray(data) ? data : data?.items ?? [];
            const count = list.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
            setTotalUnread(count);
          })
          .catch(() => {});
      } else navigate('/login');
      setIsLoading(false);
    }).catch(() => { navigate('/login'); setIsLoading(false); });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrop(null);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchResults(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults(null); return; }
    searchTimer.current = setTimeout(() => doSearch(val.trim()), 350);
  };

  const doSearch = async (q) => {
    setSearching(true);
    try {
      const [placesRes, usersRes] = await Promise.allSettled([
        placeApi.getAll({ search: q, pageNumber: 1, pageSize: 4 }),
        api.get('/users', { params: { search: q, pageNumber: 1, pageSize: 4 } })
          .then(r => r.data?.items ?? r.data?.data?.items ?? []),
      ]);
      setSearchResults({
        places: placesRes.status === 'fulfilled' ? (placesRes.value?.items ?? []).slice(0, 4) : [],
        users:  usersRes.status  === 'fulfilled' ? (usersRes.value  ?? []).slice(0, 4) : [],
      });
    } catch {
      setSearchResults({ places: [], users: [] });
    }
    setSearching(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setSearchResults(null);
      navigate(`/places?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') { setSearchResults(null); setQuery(''); }
  };

  const toggle      = (name) => setOpenDrop(prev => prev === name ? null : name);
  const getInitials = () => currentUser?.username?.slice(0, 2).toUpperCase() ?? '?';
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setOpenDrop(null);
    navigate('/login');
  };

  const hasResults = searchResults && (searchResults.places.length > 0 || searchResults.users.length > 0);

  return (
    <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>

      {/* ── Search (hidden on /explore — spacer keeps controls on the right) ── */}
      {hideSearch && <div style={{ flex: 1 }} />}
      {!hideSearch && (
        <div className={styles.searchWrap} ref={searchRef}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Поиск мест и людей…"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => query.trim() && doSearch(query.trim())}
          />

          {searchResults && (
            <div className={styles.searchResults}>
              {!hasResults ? (
                <div className={styles.resultsEmpty}>
                  {searching ? 'Поиск…' : 'Ничего не найдено'}
                </div>
              ) : (
                <>
                  {searchResults.places.length > 0 && (
                    <div className={styles.resultsSection}>
                      <div className={styles.resultsSectionTitle}>Места</div>
                      {searchResults.places.map(place => (
                        <button key={place.placeId} className={styles.resultItem}
                          onClick={() => { setSearchResults(null); setQuery(''); navigate(`/places/${place.placeId}`); }}>
                          <div className={styles.resultPlaceIcon}>
                            {place.coverImageUrl
                              ? <img src={place.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                              : <span>📍</span>}
                          </div>
                          <div>
                            <div className={styles.resultName}>{place.name}</div>
                            <div className={styles.resultSub}>{place.city ?? ''}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.places.length > 0 && searchResults.users.length > 0 && (
                    <div className={styles.resultsDivider} />
                  )}

                  {searchResults.users.length > 0 && (
                    <div className={styles.resultsSection}>
                      <div className={styles.resultsSectionTitle}>Люди</div>
                      {searchResults.users.map(user => (
                        <button key={user.userId} className={styles.resultItem}
                          onClick={() => { setSearchResults(null); setQuery(''); navigate(`/users/${user.userId}`); }}>
                          <div className={styles.resultAvatar}>
                            {user.profilePicture
                              ? <img src={user.profilePicture} alt="" />
                              : user.username?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.resultName}>{user.name || user.username}</div>
                            <div className={styles.resultSub}>@{user.username}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Right controls ── */}
      <div className={styles.controls} ref={navRef}>

        <div className={styles.iconBtnWrap}>
          <button className={styles.iconBtn} onClick={() => navigate('/messages')} title="Сообщения">
            <MessageIcon />
          </button>
          {totalUnread > 0 && (
            <span className={styles.msgBadge}>{totalUnread > 99 ? '99+' : totalUnread}</span>
          )}
        </div>

        <div className={styles.dropdownWrap}>
          <button
            className={`${styles.iconBtn} ${openDrop === 'notif' ? styles.open : ''}`}
            onClick={() => toggle('notif')}
            title="Уведомления"
          >
            <BellIcon />
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

        <div className={styles.dropdownWrap}>
          <button
            className={`${styles.langBtn} ${openDrop === 'lang' ? styles.open : ''}`}
            onClick={() => toggle('lang')}
          >
            <span className={styles.langFlag}>{LANGUAGES.find(l => l.code === lang)?.flag}</span>
            {lang}
            <ChevronIcon />
          </button>
          {openDrop === 'lang' && (
            <div className={`${styles.dropdown} ${styles.langDropdown}`}>
              {LANGUAGES.map(l => (
                <button key={l.code}
                  className={`${styles.langOption} ${lang === l.code ? styles.selected : ''}`}
                  onClick={() => { setLang(l.code); setOpenDrop(null); }}>
                  <span className={styles.langFlag}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.divider} />

        <div className={styles.dropdownWrap}>
          {isLoading ? (
            <div className={styles.avatarSkeleton} />
          ) : (
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
                    <div className={styles.dropdownName}>{currentUser?.name || currentUser?.username}</div>
                    <div className={styles.dropdownUsername}>@{currentUser?.username}</div>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => { navigate('/profile'); setOpenDrop(null); }}>
                    <ProfileIcon /> Профиль
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { navigate('/settings'); setOpenDrop(null); }}>
                    <SettingsIcon /> Настройки
                  </button>
                  <div className={styles.dropdownSep} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={handleLogout}>
                    <LogoutIcon /> Выйти
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function MessageIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function BellIcon()    { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>; }
function ChevronIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>; }
function ProfileIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SettingsIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function LogoutIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
