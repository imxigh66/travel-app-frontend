// widgets/TopNavbar/TopNavbar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  { getCurrentUser  }  from '../../entities/user/api/userApi';
import  UserAvatar  from '../../entities/user/ui/UserAvatar';
import styles from './TopNavbar.module.css';

export default function TopNavbar({ onUserLoad, collapsed = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      // Передаём данные пользователя наверх если нужно
      if (onUserLoad) {
        onUserLoad(user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      
      // Если пользователь не авторизован, перенаправляем на логин
      if (error.message === 'Unauthorized' || error.message === 'No authentication token') {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return (
      <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <LogoIcon />
            <span className={styles.logoText}>TravelFlow</span>
          </div>
          
          <div className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <SearchIcon />
              <input
                type="text"
                placeholder="search..."
                disabled
                className={styles.searchInput}
              />
            </div>
          </div>
          
          <div className={styles.avatarSkeleton} />
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.navbar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo} onClick={() => navigate('/')}>
          <LogoIcon />
          <span className={styles.logoText}>TravelFlow</span>
        </div>

        {/* Search Bar */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              type="text"
              placeholder="search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </form>

        {/* User Avatar */}
        {currentUser && (
          <UserAvatar
            user={currentUser}
            size="medium"
            onClick={handleAvatarClick}
          />
        )}
      </div>
    </header>
  );
}

// Icons
function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}